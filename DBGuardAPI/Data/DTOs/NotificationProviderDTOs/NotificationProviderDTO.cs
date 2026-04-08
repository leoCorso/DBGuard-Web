using System.Text.Json.Serialization;
using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.Data.DTOs.NotificationProviderDTOs
{
    [JsonPolymorphic(TypeDiscriminatorPropertyName = "notificationType")]
    [JsonDerivedType(typeof(EmailProviderDTO), (int)NotificationType.Email)]
    [JsonDerivedType(typeof(TextProviderDTO), (int)NotificationType.Text)]
    public class NotificationProviderDTO
    {
        public int Id { get; set; }
    }
}
