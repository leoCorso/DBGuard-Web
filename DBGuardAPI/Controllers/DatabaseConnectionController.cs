using DBGuardAPI.Data.DTOs.DatabaseConnectionDTOs;
using DBGuardAPI.Data.DTOs.RequestResponseDTOs;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Data.StaticData;
using DBGuardAPI.Helpers;
using DBGuardAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace DBGuardAPI.Controllers
{
    /// <summary>
    /// Provides api endpoints for the database connection used by guards
    /// </summary>
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DatabaseConnectionController: ControllerBase
    {
        private readonly IDbContextFactory<ApplicationDbContext> _dbContextFactory;
        private readonly ILogger<DatabaseConnectionController> _logger;
        private readonly CredentialProtector _credentialProtector;
        private readonly UserManager<User> _userManager;
        private readonly EntityViewGetter _entityViewGetter;
        public DatabaseConnectionController(IDbContextFactory<ApplicationDbContext> dbContextFactory, ILogger<DatabaseConnectionController> logger, CredentialProtector credentialProtector, UserManager<User> userManager, EntityViewGetter entityViewGetter)
        {
            _dbContextFactory = dbContextFactory;
            _logger = logger;
            _credentialProtector = credentialProtector;
            _userManager = userManager;
            _entityViewGetter = entityViewGetter;
        }

        /// <summary>
        /// Gets the details of the database connection.
        /// </summary>
        /// <remarks>Joins the user who created the database connection to include their id, username and password.
        /// Only returns the database password if the user has the role <see cref="RoleNames.Admin"/>.
        /// </remarks>
        /// <param name="databaseConnectionId">The id of the database connection to get.</param>
        /// <returns>An http action result with the database connection details.</returns>
        [ProducesResponseType<DatabaseConnectionDTO>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpGet(nameof(GetDatabaseConnectionDetail))]
        public async Task<ActionResult<DatabaseConnectionDTO>> GetDatabaseConnectionDetail([FromQuery] int databaseConnectionId)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            DatabaseConnectionDTO? databaseConnection = await context.DatabaseConnections
                .AsNoTracking()
                .Where(dc => dc.Id == databaseConnectionId)
                .Include(dc => dc.CreatedByUser)
                .Select(dc => new DatabaseConnectionDTO
                {
                    Id = dc.Id,
                    Endpoint = dc.EndPoint,
                    DatabaseEngine = dc.DatabaseEngine,
                    DatabaseName = dc.DatabaseName,
                    Username = dc.Username,
                    Password = User.IsInRole(RoleNames.Admin) && dc.Password != null ? _credentialProtector.Decrypt(dc.Password) : null,
                    CreatedByUserId = dc.CreatedByUserId,
                    CreatedByUsername = dc.CreatedByUser != null ? dc.CreatedByUser.UserName : null,
                    CreateDate = dc.CreateDate,
                    LastEdited = dc.LastEditedDate
                })
                .FirstOrDefaultAsync();
            if(databaseConnection is null)
            {
                return NotFound(new { Message = $"No database connection exists for database id {databaseConnectionId}"});
            }
            return databaseConnection;
        }
        /// <summary>
        /// Retrieves paginated, sorted, and filtered database connections.
        /// </summary>
        /// <remarks>Returns a bad request if the <see cref="SieveModel"/> object in query parameters is missing the <see cref="SieveModel.PageSize"/> or <see cref="SieveModel.Page"/> as its needed for retrieving a page.</remarks>
        /// <param name="sieveParams">Pagination, sorting, and filtering options for the query.</param>
        /// <returns>A paged response containing the matched database connections and pagination metadata</returns>
        [ProducesResponseType<PagedResponseDTO<DatabaseConnectionDTO>>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpGet(nameof(GetPagedDatabaseConnections))]
        public async Task<ActionResult<PagedResponseDTO<DatabaseConnectionDTO>>> GetPagedDatabaseConnections([FromQuery] SieveModel sieveParams)
        {
            if(sieveParams.PageSize is null || sieveParams.Page is null)
            {
                return BadRequest();
            }
            using var context = await _dbContextFactory.CreateDbContextAsync();
            IQueryable<DatabaseConnectionDTO> query = context.DatabaseConnections.AsNoTracking()
                .Include(connection => connection.CreatedByUser)
                .Select(connection => new DatabaseConnectionDTO
            {
                Id = connection.Id,
                Endpoint = connection.EndPoint,
                DatabaseEngine = connection.DatabaseEngine,
                DatabaseName = connection.DatabaseName,
                Username = connection.Username,
                CreatedByUserId = connection.CreatedByUserId,
                CreatedByUsername = connection.CreatedByUser!.UserName!,
                CreateDate = connection.CreateDate,
                LastEdited = connection.LastEditedDate
                }).AsQueryable();
            return await _entityViewGetter.GetPagedResponseAsync(sieveParams, query);
        }
        /// <summary>
        /// Gets a database connection to edit.
        /// </summary>
        /// <param name="connectionId">The database connection id to edit.</param>
        /// <returns>The database connection to edit</returns>
        [ProducesResponseType<CreateDatabaseConnectionDTO>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpGet(nameof(GetDatabaseConnectionToEdit))]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<ActionResult<CreateDatabaseConnectionDTO>> GetDatabaseConnectionToEdit([FromQuery] int connectionId)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            CreateDatabaseConnectionDTO? dbToEdit = await context.DatabaseConnections
                .Where(conn => conn.Id == connectionId)
                .Select(conn => new CreateDatabaseConnectionDTO
                {
                    Id = conn.Id,
                    Endpoint = conn.EndPoint,
                    DatabaseEngine = conn.DatabaseEngine,
                    DatabaseName = conn.DatabaseName,
                    Username = conn.Username,
                    Password = conn.Password != null ? _credentialProtector.Decrypt(conn.Password) : null
                })
                .FirstOrDefaultAsync();
            if(dbToEdit is null)
            {
                _logger.LogWarning("A database connection was requested for editing that does not exist {DatabaseConnectionId}", connectionId);
                return NotFound();
            }
            return dbToEdit;
        }
        /// <summary>
        /// Creates a new database connection.
        /// </summary>
        /// <remarks>
        /// Endpoint and database name are required and cannot be empty.
        /// Database username and password are optional, but if provided cannot be empty.
        /// Returns a conflict if a database connection with a duplicate database engine, name, and username exist.
        /// Uses <see cref="CredentialProtector"/> service to encrypt the password if provided.
        /// If <see cref="CreateDatabaseConnectionDTO.ValidateConnection"/> is true, attempts a live connection before saving.
        /// </remarks>
        /// <param name="newConnection">The database connection to create</param>
        /// <returns>The created database connection.</returns>
        [HttpPost(nameof(PostDatabaseConnection))]
        [Authorize(Roles = RoleNames.Admin)]
        [ProducesResponseType<SimpleDatabaseConnectionDTO>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]

        public async Task<ActionResult> PostDatabaseConnection(CreateDatabaseConnectionDTO newConnection)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            User user = (await _userManager.GetUserAsync(User))!;

            if ((await context.DatabaseConnections.AsNoTracking().AnyAsync(conn => conn.DatabaseEngine == newConnection.DatabaseEngine && conn.DatabaseName == newConnection.DatabaseName && newConnection.Username == conn.Username)))
            {
                return Conflict(new { Message = "This database connection already exists" });
            }
            if (string.IsNullOrWhiteSpace(newConnection.Endpoint))
            {
                return BadRequest(new { Message = "The database endpoint cannot be null or empty" });
            }
            if (string.IsNullOrWhiteSpace(newConnection.DatabaseName))
            {
                return BadRequest(new { Message = "The database name cannot be null or empty" });
            }
            if (newConnection.Username is not null && string.IsNullOrWhiteSpace(newConnection.Username))
            {
                return BadRequest(new { Message = "The database username must be null or contain a non-empty value" });
            }
            if (newConnection.Password is not null && string.IsNullOrWhiteSpace(newConnection.Password))
            {
                return BadRequest(new { Message = "The database password must be null or contain a non-empty value" });
            }
            if (newConnection.ValidateConnection)
            {
                try
                {
                    string connectionString = QueryHelper.BuildConnectionString(newConnection.DatabaseEngine, newConnection.Endpoint, newConnection.DatabaseName, newConnection.Username, newConnection.Password);
                    QueryHelper.ValidateDatabaseConnection(newConnection.DatabaseEngine, connectionString);
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status502BadGateway, new { Message = $"Could not create connection to the database. ({ex.Message})" });
                }
            }
            DatabaseConnection newConnObject = new()
            {
                EndPoint = newConnection.Endpoint.Trim(),
                DatabaseEngine = newConnection.DatabaseEngine,
                DatabaseName = newConnection.DatabaseName.Trim(),
                Username = newConnection.Username?.Trim(),
                Password = newConnection.Password is not null ? _credentialProtector.Encrypt(newConnection.Password) : null,
                CreatedByUserId = user.Id
            };
            await context.DatabaseConnections.AddAsync(newConnObject);
            await context.SaveChangesAsync();
            _logger.LogInformation("A database connection was created {ConnectionId}", newConnObject.Id);
            return CreatedAtAction(nameof(GetDatabaseConnectionDetail), new { id = newConnObject.Id }, new SimpleDatabaseConnectionDTO
            {
                Id = newConnObject.Id,
                Endpoint = newConnObject.EndPoint,
                DatabaseName = newConnObject.DatabaseName,
                Username = newConnObject.Username,
                DatabaseEngine = newConnObject.DatabaseEngine
            });
        }

        /// <summary>
        /// Tests the database connection.
        /// </summary>
        /// <remarks>
        /// Creates the connection string, connects to the database and opens a connection.
        /// Uses the <see cref="CredentialProtector"/> service to decrypt the database password if required.
        /// </remarks>
        /// <param name="connectionId">The connection id of the database connection to test</param>
        /// <returns>OK result if connectionn was successful or a exception status otherwise.</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]
        [HttpPost(nameof(TestDatabaseConnection))]
        public async Task<ActionResult> TestDatabaseConnection([FromQuery] int connectionId)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            DatabaseConnection? connection = await context.DatabaseConnections.FindAsync(connectionId);
            if(connection is null)
            {
                _logger.LogWarning("A database connection test was tried on a non-existing database {ConnectionId}", connectionId);
                return NotFound();
            }
            try
            {
                
                string? password = connection.Password is not null ? _credentialProtector.Decrypt(connection.Password) : null;
                string connectionString = QueryHelper.BuildConnectionString(connection!.DatabaseEngine, connection.EndPoint, connection.DatabaseName, connection.Username, password);
                QueryHelper.ValidateDatabaseConnection(connection.DatabaseEngine, connectionString);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status502BadGateway, new { Message = $"Could not create connection to the database. ({ex.Message})" });
            }
            return Ok(new { Message = "Database connection is healthy" });
        }
        /// <summary>
        /// Updates a database connection.
        /// </summary>
        /// <remarks>
        /// Endpoint and DatabaseName are required.
        /// The username and password is optional if not required by the database engine.
        /// If <see cref="CreateDatabaseConnectionDTO.ValidateConnection"/> is true it will test the database connection before updating.
        /// </remarks>
        /// <param name="updatedConnection">The database connection with updated properties.</param>
        /// <returns>The id of the database connection that was updated.</returns>
        [ProducesResponseType<CreateDatabaseConnectionDTO>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]
        [HttpPut(nameof(PutDatabaseConnection))]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<ActionResult<CreateDatabaseConnectionDTO>> PutDatabaseConnection(CreateDatabaseConnectionDTO updatedConnection)
        {
            if (updatedConnection.Id is null)
            {
                _logger.LogError("A database connection put request was received with no connection id");
                return BadRequest();
            }
            using var context = await _dbContextFactory.CreateDbContextAsync();
            DatabaseConnection? connection = await context.DatabaseConnections.FindAsync(updatedConnection.Id);
            if (connection is null)
            {
                _logger.LogWarning("A database connection put request was received with an id not matching any record {Id}", updatedConnection.Id);
                return NotFound(new { Message = $"No connection to edit was found with the specified id {updatedConnection.Id}" });

            }
            if ((await context.DatabaseConnections.AsNoTracking().AnyAsync(conn => conn.DatabaseEngine == updatedConnection.DatabaseEngine && conn.DatabaseName == updatedConnection.DatabaseName && updatedConnection.Username == conn.Username && conn.Id != updatedConnection.Id)))
            {
                return Conflict(new { Message = "This database connection already exists" });
            }
            if (string.IsNullOrWhiteSpace(updatedConnection.Endpoint))
            {
                return BadRequest(new { Message = "The database endpoint cannot be empty or null" });
            }
            if (string.IsNullOrWhiteSpace(updatedConnection.DatabaseName))
            {
                return BadRequest(new { Message = "The database name cannot be empty or null" });
            }
            if (connection.Username is not null && string.IsNullOrWhiteSpace(connection.Username))
            {
                return BadRequest(new { Message = "The database username must be null or contain a non-empty value" });
            }
            if (connection.Password is not null && string.IsNullOrWhiteSpace(connection.Password))
            {
                return BadRequest(new { Message = "The database password must be null or contain a non-empty value" });
            }
            if (updatedConnection.ValidateConnection)
            {
                try
                {
                    string connectionString = QueryHelper.BuildConnectionString(updatedConnection.DatabaseEngine, updatedConnection.Endpoint, updatedConnection.DatabaseName, updatedConnection.Username, updatedConnection.Password);
                    QueryHelper.ValidateDatabaseConnection(updatedConnection.DatabaseEngine, connectionString);
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status502BadGateway, new { Message = $"Could not modify connection to the database. ({ex.Message})" });
                }
            }
            connection.EndPoint = updatedConnection.Endpoint.Trim();
            connection.DatabaseEngine = updatedConnection.DatabaseEngine;
            connection.DatabaseName = updatedConnection.DatabaseName.Trim();
            connection.Username = updatedConnection.Username?.Trim();
            if(string.IsNullOrWhiteSpace(connection.Password) || _credentialProtector.Decrypt(connection.Password) != updatedConnection.Password)
            {
                connection.Password = string.IsNullOrWhiteSpace(updatedConnection.Password) ? null : _credentialProtector.Encrypt(updatedConnection.Password);

            }

            await context.SaveChangesAsync();
            _logger.LogInformation("A database connection was edited {ConnectionId}", updatedConnection.Id);
            return CreatedAtAction(nameof(GetDatabaseConnectionDetail), new { updatedConnection.Id});
        }

        /// <summary>
        /// Deletes a specified database connection.
        /// </summary>
        /// <remarks>Returns a conflict if there exists guards using the specified connection id.</remarks>
        /// <param name="connectionId">The database id to delete.</param>
        /// <returns>Result of operation.</returns>
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [HttpDelete(nameof(DeleteDatabaseConnection))]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<ActionResult> DeleteDatabaseConnection([FromQuery] int connectionId)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            DatabaseConnection? connectionToDel = await context.DatabaseConnections.FindAsync(connectionId);
            if(connectionToDel is null)
            {
                _logger.LogWarning("A database connection deletion was requested for a non-existing database connection {ConnectionId}", connectionId);
                return NotFound();
            }
            if(await(context.Guards.AsNoTracking().AnyAsync(g => g.DatabaseConnectionId == connectionId)))
            {
                return Conflict(new { Message = "There are guards using this database connection. Please update the guards before deleting." });
            }
            context.DatabaseConnections.Remove(connectionToDel);
            await context.SaveChangesAsync();
            _logger.LogInformation("A database connection was deleted {ConnectionId}", connectionId);
            return NoContent();
        }
    }
}
