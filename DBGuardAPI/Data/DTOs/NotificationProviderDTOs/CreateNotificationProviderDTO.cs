using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.Data.DTOs.NotificationProviderDTOs
{
    public class CreateNotificationProviderDTO
    {
        public int? Id { get; set; }
        public NotificationType ProviderType { get; set; }
        public bool VerifyProvider { get; set; } = true;

    }
    public class CreateEmailNotificationProviderDTO: CreateNotificationProviderDTO
    {
        public required string SMTPServer { get; set; }
        public int Port { get; set; }
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string SenderEmail { get; set; }
    }
}
