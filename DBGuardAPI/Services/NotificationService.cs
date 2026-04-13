using DBGuardAPI.Data.Models;
using DBGuardAPI.Data.Models.GuardNotifications;
using Microsoft.EntityFrameworkCore;
using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.Services
{
    public class NotificationService
    {
        private readonly IDbContextFactory<ApplicationDbContext> _dbContextFactory;
        private readonly ILogger<NotificationService> _logger;
        public NotificationService(IDbContextFactory<ApplicationDbContext> dbContextFactory, ILogger<NotificationService> logger)
        {
            _dbContextFactory = dbContextFactory;
            _logger = logger;
        }
        public async Task ProcesNotifications(List<GuardNotification> notifications, string? message = null)
        {
            foreach(GuardNotification notification in notifications) 
            {
                switch (notification.NotificationType)
                {
                    case NotificationType.Email:
                        await SendEmailNotification((EmailNotification)notification, message);
                        break;
                    case NotificationType.Text:
                        await SendTextNotification((TextNotification)notification, message);
                        break;
                }
            }
        }
        private async Task SendEmailNotification(EmailNotification notification, string? message = null)
        {
            Console.WriteLine("Mock Sending Email");
        }
        private async Task SendTextNotification(TextNotification notification, string? message = null)
        {
            Console.WriteLine("Mock Sending Text");
        }
    }
}
