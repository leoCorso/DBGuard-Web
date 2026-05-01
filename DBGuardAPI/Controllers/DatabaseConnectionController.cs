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
    [ApiController]
    [Route("api/[controller]")]
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

        [Authorize]
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
                    CreatedByUsername = dc.CreatedByUser!.UserName!,
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
        [HttpPost(nameof(PostDatabaseConnection))]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<ActionResult> PostDatabaseConnection(CreateDatabaseConnectionDTO newConnection)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            User? user = await _userManager.GetUserAsync(User);
            if (user is null)
            {
                return NotFound();
            }
            if ((await context.DatabaseConnections.AsNoTracking().AnyAsync(conn => conn.DatabaseEngine == newConnection.DatabaseEngine && conn.DatabaseName == newConnection.DatabaseName && newConnection.Username == conn.Username)))
            {
                return Conflict(new { Message = "This database connection already exists" });
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
            if (string.IsNullOrWhiteSpace(newConnection.Endpoint))
            {
                return BadRequest(new { Message = "The database endpoint cannot be null or empty" });
            }
            if (string.IsNullOrWhiteSpace(newConnection.DatabaseName))
            {
                return BadRequest(new { Message = "The database name cannot be null or empty" });
            }
            if (newConnection.Username is not null && newConnection.Username == string.Empty)
            {
                return BadRequest(new { Message = "The database username must be null or contain a non-empty value" });
            }
            if (newConnection.Password is not null && newConnection.Password == string.Empty)
            {
                return BadRequest(new { Message = "The database password must be null or contain a non-empty value" });
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
            if (connection.Username is not null && connection.Username == string.Empty)
            {
                return BadRequest(new { Message = "The database username must be null or contain a non-empty value" });
            }
            if (connection.Password is not null && connection.Password == string.Empty)
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
            if(connection.Password is not null)
            {
                connection.Password = _credentialProtector.Encrypt(connection.Password);
            }
            await context.SaveChangesAsync();
            _logger.LogInformation("A database connection was edited {ConnectionId}", updatedConnection.Id);
            return CreatedAtAction(nameof(GetDatabaseConnectionDetail), new { Id = updatedConnection.Id});
        }
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
