using DBGuardAPI.Data.DTOs.NotificationProviderDTOs;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Data.Models.ServiceProviders;
using DBGuardAPI.Data.StaticData;
using DBGuardAPI.Helpers;
using DBGuardAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DBGuardAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationProvidersController: ControllerBase
    {
        private readonly IDbContextFactory<ApplicationDbContext> _dbContextFactory;
        private readonly CredentialProtector _credentialProtector;
        private readonly UserManager<User> _userManager;
        private readonly ILogger<NotificationProvidersController> _logger;
        public NotificationProvidersController(IDbContextFactory<ApplicationDbContext> dbContextFactory, CredentialProtector credentialProtector, ILogger<NotificationProvidersController> logger, UserManager<User> userManager)
        {
            _dbContextFactory = dbContextFactory;
            _credentialProtector = credentialProtector;
            _logger = logger;
            _userManager = userManager;
        }
        [HttpGet(nameof(GetNotificationProvider) + "/{id}")]
        public async Task<ActionResult<NotificationProviderDTO>> GetNotificationProvider(int id)
        {
            throw new NotImplementedException();
        }
        [Authorize(Roles = RoleNames.Admin)]
        [HttpPost(nameof(PostNotificationProvider))]
        public async Task<ActionResult<NotificationProviderDTO>> PostNotificationProvider(CreateNotificationProviderDTO newProvider)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            User user = (await _userManager.GetUserAsync(User))!;
            NotificationProvider provider;
            switch(newProvider)
            {
                case CreateEmailNotificationProviderDTO emailNotificationProviderDTO:
                    provider = new EmailProvider
                    {
                        SMTPServer = emailNotificationProviderDTO.SMTPServer,
                        Port = emailNotificationProviderDTO.Port,
                        Username = emailNotificationProviderDTO.Username,
                        Password = _credentialProtector.Encrypt(emailNotificationProviderDTO.Password),
                        CreatedByUserId = user.Id
                    };
                    break;
                default:
                    return BadRequest(new { Message = $"Provider of type {newProvider.ProviderType} is not supported" });
            }
            await context.AddAsync(provider);
            await context.SaveChangesAsync();
            return NotificationProviderHelper.MapToDTO(provider);
        }
    }
}
