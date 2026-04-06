using DBGuardAPI.Data.Enums;
using DBGuardAPI.Data.Models.GuardNotifications;

namespace DBGuardAPI.Data.Models.ServiceProviders
{
    public class NotificationProvider
    {
        public int Id { get; set; }
        public DateTimeOffset CreateDate { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset LastEditedDate { get; set; } = DateTimeOffset.UtcNow;
        public int CreatedByUserId { get; set; }
        public NotificationType ServiceType { get; set; }
        public ICollection<GuardNotification> GuardNotifications { get; set; } = [];
        public User? CreatedByUser { get; set; }
    }
}
