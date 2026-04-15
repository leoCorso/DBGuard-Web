using System.Data.Common;
using Dapper;
using DBGuardAPI.Data.DTOs;
using DBGuardAPI.Data.DTOs.DatabaseConnectionDTOs;
using DBGuardAPI.Data.DTOs.GuardDTOs;
using DBGuardAPI.Data.DTOs.NotificationProviderDTOs;
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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;
using ZstdSharp.Unsafe;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace DBGuardAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = RoleNames.User)]
    public class GuardsController: ControllerBase
    {
        private readonly IDbContextFactory<ApplicationDbContext> _dbContextFactory;
        private readonly ILogger<GuardsController> _logger;
        private readonly CredentialProtector _credentialProtector;
        private readonly UserManager<User> _userManager;
        private readonly EntityViewGetter _entityViewGetter;
        public GuardsController(IDbContextFactory<ApplicationDbContext> dbContextFactory, ILogger<GuardsController> logger, CredentialProtector credentialProtector, UserManager<User> user, EntityViewGetter entityViewGetter)
        {
            _dbContextFactory = dbContextFactory;
            _logger = logger;
            _credentialProtector = credentialProtector;
            _userManager = user;
            _entityViewGetter = entityViewGetter;
        }

        [HttpGet(nameof(GetCreateGuardsReferenceData))]
        public async Task<ActionResult<CreateGuardsReferenceData>> GetCreateGuardsReferenceData()
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            List<DatabaseConnectionDTO> connections = await context.DatabaseConnections
                .AsNoTracking()
                .Select(connection => new DatabaseConnectionDTO
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
                .ToListAsync();

            return new CreateGuardsReferenceData
            {
                DatabaseConnections = connections,
                NotificationProviders = notificationProviders.Select(NotificationProviderHelper.MapToDTO).ToList()
            };
        }
        [HttpGet(nameof(GetGuard) + "/{id}")]
        public async Task<ActionResult<GuardDTO>> GetGuard()
        {
            throw new NotImplementedException();
        }
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

            try
            {
                string? password = null;
                if (dbConnection.Password is not null)
                {
                    password = _credentialProtector.Decrypt(dbConnection.Password);
                }
                string connectionString = QueryHelper.BuildConnectionString(dbConnection.DatabaseEngine, dbConnection.EndPoint, dbConnection.DatabaseName, dbConnection.Username, password);
                DbConnection connection = QueryHelper.GetDatabaseConnection(dbConnection.DatabaseEngine, connectionString);
                // Test query and ensure it executes
                IDictionary<string, object> resultSet = connection.QuerySingle(newGuard.TriggerQuery);
                // Ensure query contains column specified
                if (!TriggerHelper.ColumnExistsInSet(newGuard.CountColumn, resultSet))
                {
                    throw new InvalidDataException($"The column {newGuard.CountColumn} is not present in the querys result set");
                }

                // Ensure row and column value is int
                if (!int.TryParse(resultSet[newGuard.CountColumn].ToString(), out int count))
                {
                    throw new InvalidDataException($"The count column in result set is not a int parseable value.");
                }
                // Create guard
                Guard guard = new()
                {
                    GuardName = newGuard.GuardName,
                    GuardDescription = newGuard.GuardDescription,
                    CreatedByUserId = user.Id,
                    TriggerQuery = newGuard.TriggerQuery,
                    CountColumn = newGuard.CountColumn,
                    TriggerOperator = newGuard.TriggerOperator,
                    TriggerValue = newGuard.TriggerValue,
                    DatabaseConnectionId = dbConnection.Id,
                    NotifyOnClear = newGuard.NotifyOnClear,
                    NotifyOnError = newGuard.NotifyOnError,
                    NotifyOnTrigger = newGuard.NotifyOnTrigger,
                    RunPeriodInMinutes = newGuard.RunPeriodInMinutes,
                    GuardNotifications = newGuard.Notifications.Select(notification => GuardNotificationHelper.MapToEntity(notification)).ToList()
                };
                await context.Guards.AddAsync(guard);
                await context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetGuard), new { id = guard.Id }, new GuardDTO
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
    }
}
