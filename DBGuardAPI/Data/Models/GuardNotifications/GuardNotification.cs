using DBGuardAPI.Data.Enums;
using DBGuardAPI.Data.Models.ServiceProviders;

namespace DBGuardAPI.Data.Models.GuardNotifications
{
    public abstract class GuardNotification
    {
        public int Id { get; set; }
        public int GuardId { get; set; }
        public NotificationType NotificationType { get; set; }
        public int NotificationProviderId { get; set; }
        public Guard? Guard { get; set; }
        public NotificationProvider? NotificationProvider { get; set; }
    }
}
