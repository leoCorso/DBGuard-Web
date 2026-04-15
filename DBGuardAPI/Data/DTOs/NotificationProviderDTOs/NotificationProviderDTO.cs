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
    }
    public class EmailProviderDTO : NotificationProviderDTO
    {
        public required string SMTPServer { get; set; }
        public required string Username { get; set; }
        public int Port { get; set; }
    }
    public class TextProviderDTO : NotificationProviderDTO
    {
        public required string PhoneNumber { get; set; }
    }
}
