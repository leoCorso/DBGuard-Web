using System.Data.Common;
using System.Threading.Channels;
using Dapper;
using DBGuardAPI.Data.DTOs;
using DBGuardAPI.Data.DTOs.DatabaseConnectionDTOs;
using DBGuardAPI.Data.DTOs.GuardDTOs;
using DBGuardAPI.Data.DTOs.NotificationProviderDTOs;
using DBGuardAPI.Data.Models.NotificationTransactions;
using DBGuardAPI.Data.DTOs.NotificationsDTOs;
using DBGuardAPI.Data.DTOs.RequestResponseDTOs;
using DBGuardAPI.Data.Enums;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Data.Models.GuardNotifications;
using DBGuardAPI.Data.Models.ServiceProviders;
using DBGuardAPI.Data.StaticData;
using DBGuardAPI.Data.Views;
using DBGuardAPI.Helpers;
using DBGuardAPI.Services;
using Google.Protobuf.WellKnownTypes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using System.Globalization;
using DBGuardAPI.Data.DTOs.Shared;

namespace DBGuardAPI.Controllers
{
    /// <summary>
    /// Controller with API endpoints to Get, Post, Put, and Delete guard related data.
    /// </summary>
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GuardsController: ControllerBase
    {
        private readonly IDbContextFactory<ApplicationDbContext> _dbContextFactory;
        private readonly ILogger<GuardsController> _logger;
        private readonly CredentialProtector _credentialProtector;
        private readonly UserManager<User> _userManager;
        private readonly EntityViewGetter _entityViewGetter;
        private readonly GuardProcessor _guardProcessor;

        public GuardsController(IDbContextFactory<ApplicationDbContext> dbContextFactory, ILogger<GuardsController> logger, CredentialProtector credentialProtector, UserManager<User> user, EntityViewGetter entityViewGetter, GuardProcessor guardProcessor)
        {
            _dbContextFactory = dbContextFactory;
            _logger = logger;
            _credentialProtector = credentialProtector;
            _userManager = user;
            _entityViewGetter = entityViewGetter;
            _guardProcessor = guardProcessor;
        }

        /// <summary>
        /// Gets reference data used when creating a new guard.
        /// </summary>
        /// <returns>The guard reference data.</returns>
        [ProducesResponseType<CreateGuardsReferenceData>(StatusCodes.Status200OK)]
        [HttpGet(nameof(GetCreateGuardsReferenceData))]
        public async Task<ActionResult<CreateGuardsReferenceData>> GetCreateGuardsReferenceData()
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            List<SimpleDatabaseConnectionDTO> connections = await context.DatabaseConnections
                .AsNoTracking()
                .Select(connection => new SimpleDatabaseConnectionDTO
                {
                    Id = connection.Id,
                    Endpoint = connection.EndPoint,
                    DatabaseEngine = connection.DatabaseEngine,
                    DatabaseName = connection.DatabaseName,
                    Username = connection.Username,
                })
                .ToListAsync();
            List<NotificationProvider> notificationProviders = await context.NotificationProviders
                .AsNoTracking()
                .Include(provider => provider.CreatedByUser)
                .ToListAsync();

            return new CreateGuardsReferenceData
            {
                DatabaseConnections = connections,
                NotificationProviders = notificationProviders.Select(NotificationProviderHelper.MapToDTO).ToList()
            };
        }

        /// <summary>
        /// Gets the details of a guard.
        /// </summary>
        /// <remarks>Joins the user who created the guard if they exist to provide their id and name.</remarks>
        /// <param name="id">The id of the guard to get details.</param>
        /// <returns>The guard details</returns>
        [ProducesResponseType<GuardDetailDTO>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpGet(nameof(GetGuardDetail) + "/{id}")]
        public async Task<ActionResult<GuardDetailDTO>> GetGuardDetail(int id)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();

            GuardDetailDTO? guardDetail = await context.Guards
                .Include(guard => guard.CreatedByUser)
                .Select(guard => new GuardDetailDTO
                {
                    Id = guard.Id,
                    GuardName = guard.GuardName,
                    GuardDescription = guard.GuardDescription,
                    CreateDate = guard.CreateDate,
                    LastRun = guard.LastRun,
                    LastEditedDate = guard.LastEditedDate,
                    CreatedByUserId = guard.CreatedByUserId != null ? guard.CreatedByUserId : null,
                    UserName = guard.CreatedByUser != null ? guard.CreatedByUser.UserName : null,
                    TriggerQuery = guard.TriggerQuery,
                    TriggerColumn = guard.TriggerColumn,
                    TriggerOperator = guard.TriggerOperator,
                    TriggerValue = guard.TriggerValue,
                    GuardState = guard.GuardState,
                    IsActive = guard.IsActive,
                    NotifyOnClear = guard.NotifyOnClear,
                    NotifyOnError = guard.NotifyOnError,
                    NotifyOnTrigger = guard.NotifyOnTrigger,
                    TotalErrors = guard.TotalErrors,
                    TotalTriggers = guard.TotalTriggers,
                    RunPeriodInMinutes = guard.RunPeriodInMinutes,
                    DatabaseConnectionId = guard.DatabaseConnectionId
                })
            .Where(guard => guard.Id == id)
            .FirstOrDefaultAsync();
            if(guardDetail is null)
            {
                _logger.LogWarning("A guard detail was requested for a non-existing guard {GuardId}", id);
                return NotFound(new { Message = $"No guard exists for the id {id}" });
            }
            return guardDetail;
        }

        /// <summary>
        /// Filters, paginates and sorts guards.
        /// </summary>
        /// <remarks>Returns a conflict if the <see cref="SieveModel.PageSize"/> or <see cref="SieveModel.Page"/> are missing as it is required to limit return items.</remarks>
        /// <param name="sieveParams">The query parameters used to sort, paginate and filter the records.</param>
        /// <returns>A list of guards to view that are sorted, paginated and the current page, page size total items and total pages.</returns>
        [ProducesResponseType<PagedResponseDTO<GuardView>>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpGet(nameof(GetGuardsView))]
        public async Task<ActionResult<PagedResponseDTO<GuardView>>> GetGuardsView([FromQuery] SieveModel sieveParams)
        {
            if (sieveParams.PageSize == null || sieveParams.Page == null)
            {
                return BadRequest();
            }
            using var context = await _dbContextFactory.CreateDbContextAsync();
            IQueryable<GuardView> query = context.GuardView.AsNoTracking().AsQueryable();
            return await _entityViewGetter.GetPagedResponseAsync<GuardView>(sieveParams, query);
        }
        /// <summary>
        /// Filters, paginates and sorts <see cref="GuardDTO"/> records.
        /// </summary>
        /// <remarks>Returns a bad request if the <see cref="SieveModel.Page"/> or <see cref="SieveModel.PageSize"/> are missing since it is used for pagination.</remarks>
        /// <param name="sieveParams">The query parameters used for filtering, sorting and paginating.</param>
        /// <returns>The records filtered, sorted and paginated and metadata of total items, total pages, current page, and page size.</returns>
        [ProducesResponseType<PagedResponseDTO<GuardDTO>>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpGet(nameof(GetGuardsDTO))]
        public async Task<ActionResult<PagedResponseDTO<GuardDTO>>> GetGuardsDTO([FromQuery] SieveModel sieveParams)
        {
            if(sieveParams.Page is null || sieveParams.PageSize is null)
            {
                return BadRequest();
            }
            using var context = await _dbContextFactory.CreateDbContextAsync();
            IQueryable<GuardDTO> query = context.Guards.AsNoTracking().Include(guard => guard.CreatedByUser).Select(guard => new GuardDTO
            {
                Id = guard.Id,
                GuardName = guard.GuardName,
                CreateDate = guard.CreateDate,
                LastRun = guard.LastRun,
                LastEditedDate = guard.LastEditedDate,
                CreatedByUserId = guard.CreatedByUserId,
                UserName = guard.CreatedByUser!.UserName!,
                TriggerQuery = guard.TriggerQuery,
                TriggerColumn = guard.TriggerColumn,
                TriggerOperator = guard.TriggerOperator,
                TriggerValue = guard.TriggerValue,
                GuardState = guard.GuardState,
                IsActive = guard.IsActive,
                NotifyOnClear = guard.NotifyOnClear,
                NotifyOnError = guard.NotifyOnError,
                NotifyOnTrigger = guard.NotifyOnTrigger,
                TotalErrors = guard.TotalErrors,
                TotalTriggers = guard.TotalTriggers,
                RunPeriodInMinutes = guard.RunPeriodInMinutes,
                DatabaseConnectionId = guard.DatabaseConnectionId
            }).AsQueryable();
            return await _entityViewGetter.GetPagedResponseAsync<GuardDTO>(sieveParams, query);
        }
        /// <summary>
        /// Filters, paginates and sorts <see cref="GuardChangeTransactionDTO"/> records.
        /// </summary>
        /// <remarks>Returns a bad request if the <see cref="SieveModel.PageSize"/> or <see cref="SieveModel.Page"/> are missing since it is used for pagination.</remarks>
        /// <param name="sieveParams">The query parameters used to filter, paginate and sort.</param>
        /// <returns>The records filtered, paginated and sorted and metadata of total items, total pages, current page, page and page size.</returns>
        [ProducesResponseType<PagedResponseDTO<GuardChangeTransactionDTO>>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]

        [HttpGet(nameof(GetGuardChangeTransactions))]
        public async Task<ActionResult<PagedResponseDTO<GuardChangeTransactionDTO>>> GetGuardChangeTransactions([FromQuery] SieveModel sieveParams)
        {
            if (sieveParams.PageSize == null || sieveParams.Page == null)
            {
                return BadRequest();
            }
            using var context = await _dbContextFactory.CreateDbContextAsync();
            IQueryable<GuardChangeTransactionDTO> query = context.GuardChangeTransactions
                .AsNoTracking()
                .Select(change => new GuardChangeTransactionDTO
                {
                    Id = change.Id,
                    Timestamp = change.Timestamp,
                    GuardId = change.GuardId,
                    GuardState = change.GuardState,
                    PreviousGuardState = change.PreviousGuardState,
                    TriggerQuery = change.TriggerQuery,
                    TriggerOperator = change.TriggerOperator,
                    TriggerValue = change.TriggerValue,
                    DatabaseConnectionId = change.DatabaseConnectionId,
                    DatabaseConnectionEndpoint = change.DatabaseConnectionEndPoint,
                    DatabaseName = change.DatabaseName,
                    DatabaseConnectionEngine = change.DatabaseConnectionEngine,
                    DatabaseConnectionUsername = change.DatabaseConnectionUsername,
                    TriggeredValue = change.TriggeredValue,
                    Message = change.Message
                    })
                .AsQueryable();
            return (await _entityViewGetter.GetPagedResponseAsync<GuardChangeTransactionDTO>(sieveParams, query));
        }
        /// <summary>
        /// Gets a guard to edit.
        /// </summary>
        /// <remarks>Joins the guards <see cref="DatabaseConnection"/> since it can be edited from guard.</remarks>
        /// <param name="guardId">The id of the guard to edit.</param>
        /// <returns>The guard to edit.</returns>
        [ProducesResponseType<CreateGuardDTO>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpGet(nameof(GetGuardToEdit))]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<ActionResult<CreateGuardDTO>> GetGuardToEdit([FromQuery] int guardId)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            CreateGuardDTO? guardToEdit = await context.Guards.AsNoTracking()
                .Include(guard => guard.DatabaseConnection)
                .Include(guard => guard.GuardNotifications)
                .ThenInclude(notification => notification.NotificationProvider)
                .ThenInclude(provider => provider!.CreatedByUser)
                .Select(guard => new CreateGuardDTO
                {
                    Id = guard.Id,
                    GuardName = guard.GuardName,
                    GuardDescription = guard.GuardDescription,
                    TriggerQuery = guard.TriggerQuery,
                    TriggerColumn = guard.TriggerColumn,
                    TriggerOperator = guard.TriggerOperator,
                    TriggerValue = guard.TriggerValue,
                    NotifyOnClear = guard.NotifyOnClear,
                    NotifyOnError = guard.NotifyOnError,
                    NotifyOnTrigger = guard.NotifyOnTrigger,
                    RunPeriodInMinutes = guard.RunPeriodInMinutes,
                    DatabaseConnection = new SimpleDatabaseConnectionDTO
                    {
                        Id = guard.DatabaseConnection!.Id,
                        Endpoint = guard.DatabaseConnection.EndPoint,
                        DatabaseEngine = guard.DatabaseConnection.DatabaseEngine,
                        DatabaseName = guard.DatabaseConnection.DatabaseName,
                        Username = guard.DatabaseConnection.Username
                    },
                    Notifications = guard.GuardNotifications.Select(notification => GuardNotificationHelper.MapToCreateDTO(notification)).ToList()
                })
                .Where(guard => guard.Id == guardId)
                .FirstOrDefaultAsync();
            if(guardToEdit is null)
            {
                return NotFound();
            }
            return guardToEdit;
        }
        /// <summary>
        /// Groups guard changes by month and state.
        /// </summary>
        /// <remarks>Assumes twelve months.</remarks>
        /// <param name="yearSelection">The year of guard changes to get.</param>
        /// <returns>A list of twelve * count of <see cref="GuardState"/> records with the month, guard state, and number of guard states for that month.</returns>
        [ProducesResponseType<List<GuardChangeItemDTO>>(StatusCodes.Status200OK)]
        [HttpGet(nameof(GetMonthlyGuardChangeData))]
        public async Task<ActionResult<List<GuardChangeItemDTO>>> GetMonthlyGuardChangeData([FromQuery] DateTime yearSelection)
        {
            // From reference data get year
            int year = yearSelection.Year;

            // Get data for year and group by state and month
            using var context = await _dbContextFactory.CreateDbContextAsync();
            var counts = await context.GuardChangeTransactions
                .AsNoTracking()
                .Where(change => change.Timestamp.Year == year)
                .GroupBy(change => new { change.GuardState, change.Timestamp.Month })
                .Select(changeGroup => new
                {
                    changeGroup.Key.GuardState,
                    changeGroup.Key.Month,
                    Count = changeGroup.Count()
                })
                .ToListAsync();
            // Create result object by iterating months and setting 0 if it doesnt exist in group data
            List<GuardChangeItemDTO> changeItems = [];

            foreach(int month in Enumerable.Range(1, 12))
            {
                foreach(GuardState state in System.Enum.GetValues<GuardState>())
                {
                    GuardChangeItemDTO item = new()
                    {
                        Month = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(month),
                        GuardState = state,
                        Count = counts.Where(count => count.GuardState == state && count.Month == month).FirstOrDefault()?.Count ?? 0
                    };
                    changeItems.Add(item);
                }
            }
            return changeItems;
        }
        /// <summary>
        /// Gets total counts of created <see cref="Guard"/>, <see cref="GuardChangeTransaction"/>, successful <see cref="NotificationTransaction"/>, <see cref="NotificationProvider"/>, <see cref="DatabaseConnection"/> and <see cref="User"/>
        /// </summary>
        /// <returns>The total counts in a summary object.</returns>
        [ProducesResponseType<TotalSummary>(StatusCodes.Status200OK)]
        [HttpGet(nameof(GetTotalSummary))]
        public async Task<ActionResult<TotalSummary>> GetTotalSummary()
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            TotalSummary summary = new()
            {
                TotalGuards = await context.Guards.CountAsync(),
                TotalGuardChanges = await context.GuardChangeTransactions.CountAsync(),
                TotalNotificationsSent = await context.NotificationTransactions.Where(notification => notification.Successful).CountAsync(),
                TotalProviders = await context.NotificationProviders.CountAsync(),
                TotalDatabaseConnections = await context.DatabaseConnections.CountAsync(),
                TotalUsers = await context.Users.CountAsync()
            };
            return summary;
        }
        /// <summary>
        /// Creates a new guard.
        /// </summary>
        /// <remarks>If <see cref="CreateGuardDTO.ValidateGuard"/> is true it will test the guard before creation.</remarks>
        /// <param name="newGuard">The new guard information to create.</param>
        /// <returns>A simplified version of the created guard.</returns>
        /// <exception cref="InvalidDataException">Thrown when trigger column is missing from query.</exception>
        [ProducesResponseType<SimpleGuardDTO>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [Authorize(Roles = RoleNames.Admin)]
        [HttpPost(nameof(PostGuard))]
        public async Task<ActionResult> PostGuard(CreateGuardDTO newGuard)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            User user = (await _userManager.GetUserAsync(User))!;

            DatabaseConnection? dbConnection = await context.DatabaseConnections.FindAsync(newGuard.DatabaseConnection.Id);
            if (dbConnection is null)
            {
                _logger.LogError("A post guard request was received with a non-existing database connection {DBConnectionId}", newGuard.DatabaseConnection.Id);
                return NotFound(new { Message = $"No database connection exists with the specified id (${newGuard.DatabaseConnection.Id})" });
            }
            if(string.IsNullOrWhiteSpace(newGuard.TriggerQuery) || string.IsNullOrWhiteSpace(newGuard.TriggerColumn))
            {
                return BadRequest();
            }
            try
            {
                string? password = null;
                if (!string.IsNullOrWhiteSpace(dbConnection.Password))
                {
                    password = _credentialProtector.Decrypt(dbConnection.Password);
                }
                if (newGuard.ValidateGuard)
                {
                    string connectionString = QueryHelper.BuildConnectionString(dbConnection.DatabaseEngine, dbConnection.EndPoint, dbConnection.DatabaseName, dbConnection.Username, password);
                    DbConnection connection = QueryHelper.GetDatabaseConnection(dbConnection.DatabaseEngine, connectionString);
                    // Test query and ensure it executes
                    IDictionary<string, object> resultSet = connection.QuerySingle(newGuard.TriggerQuery);
                    // Ensure query contains column specified
                    if (!TriggerHelper.ColumnExistsInSet(newGuard.TriggerColumn, resultSet))
                    {
                        throw new InvalidDataException($"The column {newGuard.TriggerColumn} is not present in the querys result set");
                    }

                    // Ensure row and column value is int
                    if (!int.TryParse(resultSet[newGuard.TriggerColumn].ToString(), out int count))
                    {
                        throw new InvalidDataException($"The count column in result set is not a int parseable value.");
                    }
                }
                // Create guard
                Guard guard = new()
                {
                    GuardName = newGuard.GuardName?.Trim(),
                    GuardDescription = newGuard.GuardDescription?.Trim(),
                    CreatedByUserId = user.Id,
                    TriggerQuery = newGuard.TriggerQuery.Trim(),
                    TriggerColumn = newGuard.TriggerColumn,
                    TriggerOperator = newGuard.TriggerOperator,
                    TriggerValue = newGuard.TriggerValue,
                    DatabaseConnectionId = dbConnection.Id,
                    IsActive = newGuard.IsActive,
                    NotifyOnClear = newGuard.NotifyOnClear,
                    NotifyOnError = newGuard.NotifyOnError,
                    NotifyOnTrigger = newGuard.NotifyOnTrigger,
                    RunPeriodInMinutes = newGuard.RunPeriodInMinutes,
                    GuardNotifications = newGuard.Notifications.Select(notification => GuardNotificationHelper.MapToEntity(notification)).ToList()
                };
                await context.Guards.AddAsync(guard);
                await context.SaveChangesAsync();
                _logger.LogInformation("A new guard was created {GuardId}", guard.Id);
                foreach(var notification in guard.GuardNotifications)
                {
                    _logger.LogInformation("A new notification was created {NotificationId}", notification.Id);
                }
                return CreatedAtAction(nameof(GetGuardDetail), new { id = guard.Id }, new SimpleGuardDTO
                {
                    Id = guard.Id,
                    GuardName = guard.GuardName,
                    GuardDescription = guard.GuardDescription
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { ex.Message });
            }
        }

        /// <summary>
        /// Runs a guard manually.
        /// </summary>
        /// <param name="guardId">The id of the guard to run.</param>
        /// <returns>The guard state of the guard.</returns>
        [ProducesResponseType<GuardState>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpPost(nameof(RunGuardManually))]
        public async Task<ActionResult<GuardState>> RunGuardManually([FromQuery] int guardId)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            if(!(await context.Guards.AnyAsync(guard => guard.Id == guardId)))
            {
                _logger.LogError("A manual guard run was attempted for an invalid guard id {GuardId}", guardId);
                return NotFound();
            }
            await _guardProcessor.ProcessGuardAsync(guardId);
            Guard guardAfterProcessing = (await context.Guards.FindAsync(guardId))!;
            return guardAfterProcessing.GuardState;
        }
        /// <summary>
        /// Edits a guard.
        /// </summary>
        /// <remarks>Also edits guard notifications.</remarks>
        /// <param name="guardEdits">The guard to edit with updated information.</param>
        /// <returns>Guard with simplified information.</returns>
        [ProducesResponseType<SimpleGuardDTO>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [Authorize(Roles = RoleNames.Admin)]
        [HttpPut(nameof(PutGuard))]
        public async Task<ActionResult> PutGuard(CreateGuardDTO guardEdits)
        {
            if(guardEdits.Id is null)
            {
                _logger.LogError("A guard edit was attempted with no guardId");
                return BadRequest();
            }
            using var context = await _dbContextFactory.CreateDbContextAsync();
            // Update guard properties
            Guard? guard = await context.Guards
                .Where(guard => guard.Id == guardEdits.Id)
                .Include(guard => guard.GuardNotifications)
                .FirstOrDefaultAsync();
            if(guard is null)
            {
                _logger.LogError("A guard edit was attempted with non-existing guard id {GuardId}", guardEdits.Id);
                return NotFound();
            }
            if (string.IsNullOrWhiteSpace(guardEdits.TriggerQuery) || string.IsNullOrWhiteSpace(guardEdits.TriggerColumn))
            {
                return BadRequest();
            }
            guard.GuardName = guardEdits.GuardName?.Trim();
            guard.GuardDescription = guardEdits.GuardDescription?.Trim();
            guard.LastEditedDate = DateTimeOffset.UtcNow;
            guard.TriggerQuery = guardEdits.TriggerQuery.Trim();
            guard.TriggerColumn = guardEdits.TriggerColumn;
            guard.TriggerOperator = guardEdits.TriggerOperator;
            guard.TriggerValue = guardEdits.TriggerValue;
            guard.DatabaseConnectionId = guardEdits.DatabaseConnection.Id;
            guard.IsActive = guardEdits.IsActive;
            guard.NotifyOnClear = guardEdits.NotifyOnClear;
            guard.NotifyOnError = guardEdits.NotifyOnError;
            guard.NotifyOnTrigger = guardEdits.NotifyOnTrigger;
            guard.RunPeriodInMinutes = guardEdits.RunPeriodInMinutes;

            // Remove notifications not in guard
            List<GuardNotification> notificationToRemove = guard.GuardNotifications
                .Where(notification =>  !guardEdits.Notifications.Where(editedNotification => editedNotification.Id is not null).Select(editedNotification => editedNotification.Id).Contains(notification.Id))
                .ToList();
            context.GuardNotifications.RemoveRange(notificationToRemove);

            // Add new notifications
            List<GuardNotification> newNotifications = guardEdits.Notifications.Where(notification => notification.Id is null).Select(GuardNotificationHelper.MapToEntity).ToList();
            foreach(GuardNotification notification in newNotifications)
            {
                guard.GuardNotifications.Add(notification);
            }
            //Update edited notifications
            List<CreateNotificationDTO> editedNotifications = guardEdits.Notifications.Where(notification => notification.Id is not null).ToList();
            List<GuardNotification> notificationsToEdit = guard.GuardNotifications.Where(notifications => editedNotifications.Select(edited => edited.Id!.Value).ToHashSet().Contains(notifications.Id)).ToList();
            foreach(CreateNotificationDTO editedNotification in editedNotifications)
            {
                GuardNotification notificationToEdit = notificationsToEdit.Where(noti => noti.Id == editedNotification.Id!.Value).First();
                GuardNotificationHelper.EditNotificationValues(notificationToEdit, editedNotification);
                notificationToEdit.LastEdited = DateTime.UtcNow;
            }
            await context.SaveChangesAsync();
            _logger.LogInformation("A guard was edited {GuardId}", guard.Id);
            foreach(GuardNotification newNotification in newNotifications)
            {
                _logger.LogInformation("A new notification was added {NotificationId}", newNotification.Id);
            }
            foreach(GuardNotification editedNotification in notificationsToEdit)
            {
                _logger.LogInformation("A notification was edited {NotificationId}", editedNotification.Id);
            }
            foreach(GuardNotification removedNotification in notificationToRemove)
            {
                _logger.LogInformation("A notification was removed {NotificationId}", removedNotification.Id);
            }
            return CreatedAtAction(nameof(GetGuardDetail), new { id = guard.Id }, new SimpleGuardDTO
            {
                Id = guard.Id,
                GuardName = guard.GuardName,
                GuardDescription = guard.GuardDescription
            });
        }
        /// <summary>
        /// Deletes a guard.
        /// </summary>
        /// <remarks>Also deletes the guard notifications.</remarks>
        /// <param name="guardId">The id of the guard to delete.</param>
        /// <returns>Result of operation.</returns>
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [Authorize(Roles = RoleNames.Admin)]
        [HttpDelete(nameof(DeleteGuard))]
        public async Task<ActionResult> DeleteGuard([FromQuery] int guardId)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            Guard? guardToDelete = await context.Guards.FindAsync(guardId);
            if(guardToDelete is null)
            {
                _logger.LogError("A guard deletion was attempted on a non-existing guard {GuardId}", guardId);
                return NotFound();
            }
            List<int> notificationsRemoved = await context.GuardNotifications.AsNoTracking().Where(noti => noti.GuardId == guardToDelete.Id).Select(noti => noti.Id).ToListAsync();
            context.Guards.Remove(guardToDelete);
            await context.SaveChangesAsync();
            _logger.LogInformation("Delete a guard {GuardId}", guardId);
            foreach(int id in notificationsRemoved)
            {
                _logger.LogInformation("A notificationw was removed {NotificationId}", id);
            }
            return NoContent();
        }
    }

}
