using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.Data.Models.NotificationTransactions
{
    public class NotificationTransaction
    {
        public int Id { get; set; }
        public DateTimeOffset Timestamp { get; set; }
        public int? GuardNotificationId { get; set; }
        public NotificationType NotificationType { get; set; }
        public int GuardChangeTransactionId { get; set; }
        public GuardChangeTransaction? GuardChangeTransaction { get; set; }
    }
}
