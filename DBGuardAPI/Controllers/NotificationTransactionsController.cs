using System.Data;
using DBGuardAPI.Data.DTOs.NotificationsDTOs;
using DBGuardAPI.Data.DTOs.RequestResponseDTOs;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Data.Models.NotificationTransactions;
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
                    NotificationType = trans.NotificationType,
                    Successful = trans.Successful,
                    ErrorMessage = trans.ErrorMessage
                })
                .AsQueryable();
            return await _entityViewGetter.GetPagedResponseAsync<NotificationTransactionDTO>(sieveParams, query);
        }

        [HttpGet(nameof(GetNotificationTransactionDetail))]
        public async Task<ActionResult<NotificationTransactionDTO>> GetNotificationTransactionDetail([FromQuery] int transactionId)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            NotificationTransaction? notificationTransaction = await context.NotificationTransactions.FindAsync(transactionId);
            if(notificationTransaction is null)
            {
                _logger.LogWarning("A notification transaction was requested with a non-existing id {TransactionId}", transactionId);
                return NotFound();
            }
            return notificationTransaction switch
            {
                EmailNotificationTransaction emailTransaction => new EmailNotificationTransactionDTO
                {
                    Id = emailTransaction.Id,
                    Timestamp = emailTransaction.Timestamp,
                    GuardId = emailTransaction.GuardId,
                    GuardNotificationId = emailTransaction.GuardNotificationId,
                    NotificationType = emailTransaction.NotificationType,
                    GuardChangeTransactionId = emailTransaction.GuardChangeTransactionId,
                    Successful = emailTransaction.Successful,
                    ErrorMessage = emailTransaction.ErrorMessage,
                    EmailSubject = emailTransaction.EmailSubject,
                    EmailBody = emailTransaction.EmailBody,
                    ToEmails = emailTransaction.ToEmails,
                    CcEmails = emailTransaction.CCEmails,
                    BccEmails = emailTransaction.BCCEmails
                },
                _ => throw new NotImplementedException()
            };
        }
    }
}
