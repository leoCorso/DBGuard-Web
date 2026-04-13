using DBGuardAPI.Data.DTOs.NotificationProviderDTOs;
using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.Data.DTOs.NotificationsDTOs
{
    public class CreateNotificationDTO
    {
        public int? Id { get; set; }
        public NotificationType NotificationType { get; set; }
        public required NotificationProviderDTO NotificationProvider { get; set; }
    }
    public class CreateEmailNotificationDTO: CreateNotificationDTO
    {
        public required string EmailSubject { get; set; }
        public required string EmailBody { get; set; }
        public List<string> Emails { get; set; } = [];
    }
    public class CreateTextGuardNotificationDTO: CreateNotificationDTO
    {
        public List<string> PhoneNumbers { get; set; } = [];
        public required string TextMessage { get; set; }
    }
}
