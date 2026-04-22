using DBGuardAPI.Data.Enums;
using DBGuardAPI.Data.Models.NotificationTransactions;
using DBGuardAPI.Data.Models.ServiceProviders;

namespace DBGuardAPI.Data.Models.GuardNotifications
{
    public abstract class GuardNotification
    {
        public int Id { get; set; }
        public int GuardId { get; set; }
        public NotificationType NotificationType { get; set; }
        public DateTimeOffset CreateDate { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset LastEdited { get; set; } = DateTimeOffset.UtcNow;
        public int NotificationProviderId { get; set; }
        public Guard? Guard { get; set; }
        public NotificationProvider? NotificationProvider { get; set; }
        public ICollection<NotificationTransaction> NotificationTransactions { get; set; } = [];
    }
}
