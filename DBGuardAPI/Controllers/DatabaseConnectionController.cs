using System.Data;
using System.Net;
using DBGuardAPI.Data.DTOs.DatabaseConnectionDTOs;
using DBGuardAPI.Data.Enums;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Helpers;
using DBGuardAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DBGuardAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DatabaseConnectionController: ControllerBase
    {
        private readonly IDbContextFactory<ApplicationDbContext> _dbContextFactory;
        private readonly ILogger<DatabaseConnectionController> _logger;
        private readonly CredentialProtector _credentialProtector;
        private readonly UserManager<User> _userManager;
        public DatabaseConnectionController(IDbContextFactory<ApplicationDbContext> dbContextFactory, ILogger<DatabaseConnectionController> logger, CredentialProtector credentialProtector, UserManager<User> userManager)
        {
            _dbContextFactory = dbContextFactory;
            _logger = logger;
            _credentialProtector = credentialProtector;
            _userManager = userManager;
        }

        [HttpPost(nameof(PostDatabaseConnection))]
        public async Task<ActionResult<DatabaseConnectionDTO>> PostDatabaseConnection(CreateDatabaseConnectionDTO newConnection)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            User? user = await _userManager.GetUserAsync(User);
            if(user is null)
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
                return StatusCode(StatusCodes.Status502BadGateway, new { Message = $"Could not create connection to the database. ({ex.Message})"});
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
            return new DatabaseConnectionDTO
            {
                Id = newConnObject.Id,
                Endpoint = newConnObject.EndPoint,
                DatabaseName = newConnObject.DatabaseName,
                Username = newConnObject.Username,
                DatabaseEngine = newConnObject.DatabaseEngine
            };
        }
    }

}
