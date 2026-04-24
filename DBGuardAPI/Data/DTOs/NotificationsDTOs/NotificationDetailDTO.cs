using System.Text.Json.Serialization;
using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.Data.DTOs.NotificationsDTOs
{
    [JsonPolymorphic(TypeDiscriminatorPropertyName = "NotificationType")]
    [JsonDerivedType(typeof(EmailNotificationDetailDTO), (int)NotificationType.Email)]
    public class NotificationDetailDTO
    {
        public int Id { get; set; }
        public int GuardId { get; set; }
        public NotificationType NotificationType { get; set; }
        public int NotificationProviderId { get; set; }
        public DateTimeOffset CreateDate { get; set; }
        public DateTimeOffset LastEdited { get; set; }
        public required string CreatedByUserId { get; set; }
        public required string CreatedByUsername { get; set; }
    }
    public class EmailNotificationDetailDTO : NotificationDetailDTO
    {
        public string? EmailSubject { get; set; }
        public string? EmailBody { get; set; }
        public List<string> ToEmails { get; set; } = [];
        public List<string> CCEmails { get; set; } = [];
        public List<string> BCCEmails { get; set; } = [];
    }
}
