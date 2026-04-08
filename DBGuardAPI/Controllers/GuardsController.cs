using DBGuardAPI.Data.DTOs;
using DBGuardAPI.Data.DTOs.NotificationProviderDTOs;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Data.Models.ServiceProviders;
using DBGuardAPI.Data.StaticData;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZstdSharp.Unsafe;

namespace DBGuardAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = RoleNames.User)]
    public class GuardsController: ControllerBase
    {
        private readonly IDbContextFactory<ApplicationDbContext> _dbContextFactory;
        private readonly ILogger<GuardsController> _logger;
        public GuardsController(IDbContextFactory<ApplicationDbContext> dbContextFactory, ILogger<GuardsController> logger)
        {
            _dbContextFactory = dbContextFactory;
            _logger = logger;
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
                NotificationProviders = notificationProviders.Select(MapToDTO).ToList()
            };
        }
        private static NotificationProviderDTO MapToDTO(NotificationProvider provider) // Maps a generic notification provider to correct provider dto
        {
            return provider switch
            {
                EmailProvider email => new EmailProviderDTO
                {
                    Id = email.Id,
                    SMTPServer = email.SMTPServer,
                    Username = email.Username,
                    Port = email.Port
                },
                TextProvider text => new TextProviderDTO
                {
                    Id = text.Id,
                    PhoneNumber = text.PhoneNumber
                },
                _ => throw new InvalidOperationException()
            };
        }
    }
}
