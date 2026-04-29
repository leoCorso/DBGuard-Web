using DBGuardAPI.Data.DTOs.NotificationsDTOs;
using DBGuardAPI.Data.DTOs.RequestResponseDTOs;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Data.Models.GuardNotifications;
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
    public class NotificationsController: ControllerBase
    {
        private readonly IDbContextFactory<ApplicationDbContext> _dbContextFactory;
        private readonly ILogger<NotificationsController> _logger;
        private readonly EntityViewGetter _entityViewGetter;
        private readonly NotificationService _notificationService;
        private readonly UserManager<User> _userManager;
        public NotificationsController(IDbContextFactory<ApplicationDbContext> dbContextFactory, ILogger<NotificationsController> logger, EntityViewGetter entityViewGetter, NotificationService notificationService, UserManager<User> userManager)
        {
            _dbContextFactory = dbContextFactory;
            _logger = logger;
            _entityViewGetter = entityViewGetter;
            _notificationService = notificationService;
            _userManager = userManager;
        }

        [HttpGet(nameof(GetGuardNotifications))]
        public async Task<ActionResult<PagedResponseDTO<GuardNotificationDTO>>> GetGuardNotifications([FromQuery] SieveModel sieveParams)
        {
            if(sieveParams.Page is null || sieveParams.PageSize is null)
            {
                return BadRequest();
            }
            using var context = await _dbContextFactory.CreateDbContextAsync();
            IQueryable<GuardNotificationDTO> query = context.GuardNotifications.AsNoTracking()
            .Include(notification => notification.Guard)
            .ThenInclude(guard => guard!.CreatedByUser)
            .Select(notification => new GuardNotificationDTO
            {
                Id = notification.Id,
                GuardId = notification.GuardId,
                NotificationType = notification.NotificationType,
                CreateDate = notification.CreateDate,
                LastEdited = notification.LastEdited,
                NotificationProviderId = notification.NotificationProviderId,
                CreatedByUserId = notification.Guard!.CreatedByUserId,
                CreatedByUsername = notification.Guard!.CreatedByUser!.UserName!
            }).AsQueryable();
            PagedResponseDTO<GuardNotificationDTO> response = await _entityViewGetter.GetPagedResponseAsync<GuardNotificationDTO>(sieveParams, query);
            return response;
        }
        [HttpGet(nameof(GetNotificationConfigDetail))]
        public async Task<ActionResult<NotificationDetailDTO>> GetNotificationConfigDetail([FromQuery] int notificationId)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            GuardNotification? notification = await context.GuardNotifications.AsNoTracking()
                .Where(notification => notification.Id == notificationId)
                .Include(notification => notification.Guard)
                .ThenInclude(guard => guard!.CreatedByUser)
                .FirstOrDefaultAsync();
            if(notification is null)
            {
                _logger.LogWarning("A guard notification detail was requested on an invalid id {NotificationId}", notificationId);
                return NotFound(new { Message = $"No notification exists for Id {notificationId}"});
            }
            return GuardNotificationHelper.MapToDetailDTO(notification);
        }
        [HttpPost(nameof(TestGuardNotification))]
        public async Task<ActionResult> TestGuardNotification([FromQuery] int notificationId)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            GuardNotification? notification = await context.GuardNotifications
                .Where(notification => notification.Id == notificationId)
                .Include(notification => notification.NotificationProvider)
                .Include(notification => notification.Guard)
                .ThenInclude(guard => guard!.DatabaseConnection)
                .FirstOrDefaultAsync();
            if(notification is null)
            {
                _logger.LogError("A notification test was attempted on a non-existing notification {NotificationId}", notificationId);
                return NotFound();
            }
            try
            {
                await _notificationService.TestNotificationAsync(notification);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status502BadGateway, new { ex.Message });
            }
        }
        [HttpDelete(nameof(DeleteGuardNotification))]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<ActionResult> DeleteGuardNotification([FromQuery] int notificationId)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            GuardNotification? notificationToDelete = await context.GuardNotifications.FindAsync(notificationId);
            if(notificationToDelete is null)
            {
                _logger.LogError("A guard notification deletion was attempted on a non-existing notification {NotificationId}", notificationId);
                return NotFound();
            }
            User user = (await _userManager.GetUserAsync(User))!;
            context.GuardNotifications.Remove(notificationToDelete);
            await context.SaveChangesAsync();
            _logger.LogInformation("A guard notification was deleted {NotificationId} {UserId}", notificationId, user.Id);
            return NoContent();
        }
    }
}
