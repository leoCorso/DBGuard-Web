using DBGuardAPI.Data.DTOs.NotificationProviderDTOs;
using DBGuardAPI.Data.DTOs.RequestResponseDTOs;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Data.Models.ServiceProviders;
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
    [Authorize]
    public class NotificationProvidersController: ControllerBase
    {
        private readonly IDbContextFactory<ApplicationDbContext> _dbContextFactory;
        private readonly CredentialProtector _credentialProtector;
        private readonly UserManager<User> _userManager;
        private readonly ILogger<NotificationProvidersController> _logger;
        private readonly EntityViewGetter _entityViewGetter;
        private readonly NotificationService _notificationService;
        public NotificationProvidersController(IDbContextFactory<ApplicationDbContext> dbContextFactory, CredentialProtector credentialProtector, ILogger<NotificationProvidersController> logger, UserManager<User> userManager, EntityViewGetter entityViewGetter, NotificationService notificationService)
        {
            _dbContextFactory = dbContextFactory;
            _credentialProtector = credentialProtector;
            _logger = logger;
            _userManager = userManager;
            _entityViewGetter = entityViewGetter;
            _notificationService = notificationService;
        }
        [HttpGet(nameof(GetNotificationProviderDetail))]
        public async Task<ActionResult<NotificationProviderDTO>> GetNotificationProviderDetail([FromQuery] int id)
        {

            using var context = await _dbContextFactory.CreateDbContextAsync();
            NotificationProvider? provider = await context.NotificationProviders
                .AsNoTracking()
                .Where(provider => provider.Id == id)
                .Include(provider => provider.CreatedByUser)
                .FirstOrDefaultAsync();
            User user = (await _userManager.GetUserAsync(User))!;
            if(provider is null)
            {
                _logger.LogWarning("A notification provider detail request was made for a non-existing id {ProviderId}", id);
                return NotFound(new { Message = $"No notification provider was found for {id}" });
            }
            return provider switch
            {
                EmailProvider email => new EmailProviderDTO
                {
                    Id = email.Id,
                    NotificationType = email.ProviderType,
                    CreateDate = email.CreateDate,
                    LastEdited = email.LastEditedDate,
                    CreatedByUserId = email.CreatedByUserId,
                    CreatedByUsername = email.CreatedByUser!.UserName!,
                    SMTPServer = email.SMTPServer,
                    Username = email.Username,
                    Port = email.Port,
                    Password = await _userManager.IsInRoleAsync(user, RoleNames.Admin) ? _credentialProtector.Decrypt(email.Password) : null,
                    SenderEmail = email.SenderEmail
                }
            };
        }
        [HttpGet(nameof(GetNotificationProviders))]
        public async Task<ActionResult<PagedResponseDTO<NotificationProviderDTO>>> GetNotificationProviders([FromQuery] SieveModel sieveParams)
        {
            if(sieveParams.Page is null || sieveParams.PageSize is null)
            {
                return BadRequest();
            }
            using var context = await _dbContextFactory.CreateDbContextAsync();
            IQueryable<NotificationProviderDTO> query = context.NotificationProviders.AsNoTracking()
                .Include(provider => provider.CreatedByUser)
                .Select(provider => new NotificationProviderDTO
                {
                    Id = provider.Id,
                    NotificationType = provider.ProviderType,
                    CreateDate = provider.CreateDate,
                    LastEdited = provider.LastEditedDate,
                    CreatedByUserId = provider.CreatedByUserId,
                    CreatedByUsername = provider.CreatedByUser!.UserName!
                }).AsQueryable();
            return await _entityViewGetter.GetPagedResponseAsync(sieveParams, query);
        }
        [HttpGet(nameof(GetProviderToEdit))]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<ActionResult<CreateNotificationProviderDTO>> GetProviderToEdit([FromQuery] int providerId)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            NotificationProvider? provider = await context.NotificationProviders.FindAsync(providerId);
            if(provider is null)
            {
                _logger.LogWarning("A get provider to edit request was made on an invalid provider id {ProviderId}", providerId);
                return NotFound();
            }
            return provider switch
            {
                EmailProvider email => new CreateEmailNotificationProviderDTO
                {
                    Id = email.Id,
                    ProviderType = email.ProviderType,
                    SMTPServer = email.SMTPServer,
                    Port = email.Port,
                    Username = email.Username,
                    Password = _credentialProtector.Decrypt(email.Password),
                    SenderEmail = email.SenderEmail
                },
                _ => throw new InvalidOperationException()
            };
        }
        [Authorize(Roles = RoleNames.Admin)]
        [HttpPost(nameof(PostNotificationProvider))]
        public async Task<ActionResult<NotificationProviderDTO>> PostNotificationProvider(CreateNotificationProviderDTO newProvider)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            User user = (await _userManager.GetUserAsync(User))!;
            NotificationProvider provider;
            if (newProvider.VerifyProvider)
            {
                try
                {
                    switch (newProvider)
                    {
                        case CreateEmailNotificationProviderDTO emailNotificationProviderDTO:
                            await _notificationService.TestEmailProviderAsync(emailNotificationProviderDTO.SMTPServer, emailNotificationProviderDTO.Port, emailNotificationProviderDTO.Username, emailNotificationProviderDTO.Password);
                            break;
                    }
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status502BadGateway, new { ex.Message });

                }
            }
            switch(newProvider)
            {
                case CreateEmailNotificationProviderDTO emailNotificationProviderDTO:
                    if(string.IsNullOrWhiteSpace(emailNotificationProviderDTO.SMTPServer) || string.IsNullOrWhiteSpace(emailNotificationProviderDTO.Username) || string.IsNullOrWhiteSpace(emailNotificationProviderDTO.Password) || string.IsNullOrWhiteSpace(emailNotificationProviderDTO.SenderEmail))
                    {
                        return BadRequest();
                    }
                    provider = new EmailProvider
                    {
                        SMTPServer = emailNotificationProviderDTO.SMTPServer.Trim(),
                        Port = emailNotificationProviderDTO.Port,
                        Username = emailNotificationProviderDTO.Username.Trim(),
                        Password = _credentialProtector.Encrypt(emailNotificationProviderDTO.Password),
                        SenderEmail = emailNotificationProviderDTO.SenderEmail.Trim(),
                        CreatedByUserId = user.Id
                    };
                    break;
                default:
                    return BadRequest(new { Message = $"Provider of type {newProvider.ProviderType} is not supported" });
            }
            await context.AddAsync(provider);
            await context.SaveChangesAsync();
            _logger.LogInformation("A notification provider was created {ProviderId}", newProvider.Id);
            NotificationProvider providerToReturn = (await context.NotificationProviders.AsNoTracking().Where(provider => provider.Id == provider.Id).Include(provider => provider.CreatedByUser).FirstOrDefaultAsync())!;
            return NotificationProviderHelper.MapToDTO(providerToReturn);
        }

        [HttpPost(nameof(TestNotificationProvider))]
        public async  Task<ActionResult> TestNotificationProvider([FromQuery] int providerId)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            NotificationProvider? provider = await context.NotificationProviders
                .Where(provider => provider.Id == providerId)
                .FirstOrDefaultAsync();
            if(provider is null)
            {
                _logger.LogError("A provider test was attempted on a non-existing provider id {ProviderId}", providerId);
                return NotFound();
            }
            try
            {
                switch (provider)
                {
                    case EmailProvider emailProvider:
                        string password = _credentialProtector.Decrypt(emailProvider.Password);
                        await _notificationService.TestEmailProviderAsync(emailProvider.SMTPServer, emailProvider.Port, emailProvider.Username, password);
                        break;
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status502BadGateway, new {  ex.Message });
            }
        }
        [Authorize(Roles = RoleNames.Admin)]
        [HttpPut(nameof(PutNotificationProvider))]
        public async Task<ActionResult<NotificationProviderDTO>> PutNotificationProvider(CreateNotificationProviderDTO updatedProvider)
        {
            if(updatedProvider.Id is null)
            {
                _logger.LogError("A notification provider edit was attempted without providing a provider id");
                return BadRequest();
            }
            using var context = await _dbContextFactory.CreateDbContextAsync();
            NotificationProvider? providerToEdit = await context.NotificationProviders.FindAsync(updatedProvider.Id);
            if(providerToEdit is null)
            {
                _logger.LogWarning("A notification provider edit was attempted with an invalid provider id {ProviderId}", updatedProvider.Id);
                return NotFound();
            }

            if (updatedProvider.VerifyProvider)
            {
                try
                {
                    switch (updatedProvider)
                    {
                        case CreateEmailNotificationProviderDTO emailProvider:
                            await _notificationService.TestEmailProviderAsync(emailProvider.SMTPServer, emailProvider.Port, emailProvider.Username, emailProvider.Password);
                            break;
                    }
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status502BadGateway, new { ex.Message });
                }
            }
            switch (providerToEdit)
            {
                case EmailProvider emailProvider when updatedProvider is CreateEmailNotificationProviderDTO emailUpdatedProvider:
                    if (string.IsNullOrWhiteSpace(emailProvider.SMTPServer) || string.IsNullOrWhiteSpace(emailProvider.Username) || string.IsNullOrWhiteSpace(emailProvider.Password) || string.IsNullOrWhiteSpace(emailProvider.SenderEmail))
                    {
                        return BadRequest();
                    }
                    emailProvider.SMTPServer = emailUpdatedProvider.SMTPServer.Trim();
                    emailProvider.Port = emailUpdatedProvider.Port;
                    emailProvider.Username = emailUpdatedProvider.Username.Trim();
                    emailProvider.SenderEmail = emailUpdatedProvider.SenderEmail.Trim();
                    emailProvider.Password = _credentialProtector.Encrypt(emailUpdatedProvider.Password);
                    break;
                default:
                    _logger.LogError("A provider was edited with an invalid provider type {Type}", updatedProvider.ProviderType);
                    return BadRequest();
            }

            await context.SaveChangesAsync();
            _logger.LogInformation("A notification provider was edited {ProviderId}", updatedProvider.Id);
            NotificationProvider providerDTO = (await context.NotificationProviders.Where(provider => provider.Id == updatedProvider.Id).Include(provider => provider.CreatedByUser).FirstOrDefaultAsync())!;
            return NotificationProviderHelper.MapToDTO(providerDTO);
        }
        [HttpDelete(nameof(DeleteProvider))]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<ActionResult> DeleteProvider([FromQuery] int providerId)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            // Ensure provider exists
            NotificationProvider? providerToDel = await context.NotificationProviders.FindAsync(providerId);
            if(providerToDel is null)
            {
                _logger.LogError("A provider deleting was attempted on a non-existing provider {ProviderId}", providerId);
                return NotFound();
            }
            // Ensure no notifications are using this provider
            if(await context.GuardNotifications.AnyAsync(notification => notification.NotificationProviderId == providerId))
            {
                return Conflict(new { Message = "There are guards using this provider. Please first update or delete those notifications" });
            }
            context.NotificationProviders.Remove(providerToDel);
            await context.SaveChangesAsync();
            _logger.LogInformation("A notification provider was deleted {ProviderId}", providerId);
            return NoContent();
        }
    }
}
