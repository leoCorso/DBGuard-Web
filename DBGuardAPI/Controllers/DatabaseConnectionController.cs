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
            try
            {
                string connectionString = QueryHelper.BuildConnectionString(newConnection.DatabaseEngine, newConnection.Endpoint, newConnection.DatabaseName, newConnection.Username, newConnection.Password);
                QueryHelper.ValidateDatabaseConnection(newConnection.DatabaseEngine, connectionString);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status502BadGateway, new { Message = $"Could not create connection to the database. ({ex.Message})" });
            }
            DatabaseConnection newConnObject = new()
            {
                EndPoint = newConnection.Endpoint,
                DatabaseEngine = newConnection.DatabaseEngine,
                DatabaseName = newConnection.DatabaseName,
                Username = newConnection.Username,
                Password = newConnection.Password is not null ? _credentialProtector.Encrypt(newConnection.Password) : null,
                CreatedByUserId = user.Id
            };
            await context.DatabaseConnections.AddAsync(newConnObject);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetDatabaseConnectionDetail), new { id = newConnObject.Id }, new SimpleDatabaseConnectionDTO
            {
                Id = newConnObject.Id,
                Endpoint = newConnObject.EndPoint,
                DatabaseName = newConnObject.DatabaseName,
                Username = newConnObject.Username,
                DatabaseEngine = newConnObject.DatabaseEngine
            });
        }
    }
}
