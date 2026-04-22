using DBGuardAPI.Data.DTOs.NotificationsDTOs;
using DBGuardAPI.Data.DTOs.RequestResponseDTOs;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Data.Views;
using DBGuardAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace DBGuardAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    public class NotificationTransactionsController: ControllerBase
    {
        private readonly IDbContextFactory<ApplicationDbContext> _dbContextFactory;
        private readonly ILogger<NotificationTransactionsController> _logger;
        private readonly EntityViewGetter _entityViewGetter;
        public NotificationTransactionsController(IDbContextFactory<ApplicationDbContext> dbContextFactory, ILogger<NotificationTransactionsController> logger, EntityViewGetter entityViewGetter)
        {
            _dbContextFactory = dbContextFactory;
            _logger = logger;
            _entityViewGetter = entityViewGetter;
        }
        [HttpGet(nameof(GetNotificationTransactions))]
        public async Task<ActionResult<PagedResponseDTO<NotificationTransactionDTO>>> GetNotificationTransactions([FromQuery] SieveModel sieveParams)
        {
            if (sieveParams.PageSize == null || sieveParams.Page == null)
            {
                return BadRequest();
            }
            using var context = await _dbContextFactory.CreateDbContextAsync();
            IQueryable<NotificationTransactionDTO> query = context.NotificationTransactions
                .AsNoTracking()
                .Select(trans => new NotificationTransactionDTO
                {
                    Id = trans.Id,
                    GuardId = trans.GuardId,
                    Timestamp = trans.Timestamp,
                    GuardNotificationId = trans.GuardNotificationId,
                    GuardChangeTransactionId = trans.GuardChangeTransactionId,
                    NotificationType = trans.NotificationType
                })
                .AsQueryable();
            return await _entityViewGetter.GetPagedResponseAsync<NotificationTransactionDTO>(sieveParams, query);
        }
    }
}
