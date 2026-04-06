using DBGuardAPI.Data.Enums;
using DBGuardAPI.Data.Models.ServiceProviders;
using NotificationProvider = DBGuardAPI.Data.Models.ServiceProviders.NotificationProvider;

namespace DBGuardAPI.Data.Models.GuardNotifications
{
    public abstract class GuardNotification
    {
        public int Id { get; set; }
        public int GuardId { get; set; }
        public NotificationType NotificationType { get; set; }
        public int ServiceProviderId { get; set; }
        public Guard? Guard { get; set; }
        public NotificationProvider? NotificationProvider { get; set; }
    }
}
