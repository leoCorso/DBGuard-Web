using DBGuardAPI.Data.DTOs.NotificationsDTOs;
using DBGuardAPI.Data.DTOs.RequestResponseDTOs;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Services;
using Microsoft.AspNetCore.Authorization;
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
        public NotificationsController(IDbContextFactory<ApplicationDbContext> dbContextFactory, ILogger<NotificationsController> logger, EntityViewGetter entityViewGetter)
        {
            _dbContextFactory = dbContextFactory;
            _logger = logger;
            _entityViewGetter = entityViewGetter;
        }

        [HttpGet(nameof(GetGuardNotifications))]
        public async Task<ActionResult<PagedResponseDTO<GuardNotificationDTO>>> GetGuardNotifications([FromQuery] SieveModel sieveParams)
        {
            if(sieveParams.Page is null || sieveParams.PageSize is null)
            {
                return BadRequest();
            }
            using var context = await _dbContextFactory.CreateDbContextAsync();
            IQueryable<GuardNotificationDTO> query = context.GuardNotifications.AsNoTracking().Select(notification => new GuardNotificationDTO
            {
                Id = notification.Id,
                GuardId = notification.GuardId,
                NotificationType = notification.NotificationType,
                CreateDate = notification.CreateDate,
                LastEdited = notification.LastEdited,
                NotificationProviderId = notification.NotificationProviderId,
            }).AsQueryable();
            PagedResponseDTO<GuardNotificationDTO> response = await _entityViewGetter.GetPagedResponseAsync<GuardNotificationDTO>(sieveParams, query);
            return response;
        }
    }
}
