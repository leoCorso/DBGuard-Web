using DBGuardAPI.Data.Enums;
using DBGuardAPI.Data.Models.GuardNotifications;

namespace DBGuardAPI.Data.Models.NotificationTransactions
{
    public abstract class NotificationTransaction
    {
        public int Id { get; set; }
        public DateTimeOffset Timestamp { get; set; }
        public int? GuardId { get; set; }
        public int? GuardNotificationId { get; set; }
        public NotificationType NotificationType { get; set; }
        public int GuardChangeTransactionId { get; set; }
        public Guard? Guard { get; set; }
        public GuardNotification?  GuardNotification { get; set; }
        public GuardChangeTransaction? GuardChangeTransaction { get; set; }
    }
}
