using System.Text.Json.Serialization;
using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.Data.DTOs.NotificationProviderDTOs
{
    [JsonPolymorphic(TypeDiscriminatorPropertyName = "providerType")]
    [JsonDerivedType(typeof(EmailProviderDTO), (int)NotificationType.Email)]
    [JsonDerivedType(typeof(TextProviderDTO), (int)NotificationType.Text)]
    public class NotificationProviderDTO
    {
        public int Id { get; set; }
        public NotificationType NotificationType { get; set; }
        public DateTimeOffset CreateDate { get; set; }
        public DateTimeOffset LastEdited { get; set; }
        public required string CreatedByUserId { get; set; }
        public required string CreatedByUsername { get; set; }

    }
    public class EmailProviderDTO : NotificationProviderDTO
    {
        public required string SMTPServer { get; set; }
        public required string Username { get; set; }
        public int Port { get; set; }
        public string? Password { get; set; }
    }
    public class TextProviderDTO : NotificationProviderDTO
    {
        public required string PhoneNumber { get; set; }
    }
}
