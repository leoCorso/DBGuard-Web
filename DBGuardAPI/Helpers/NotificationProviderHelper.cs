using DBGuardAPI.Data.DTOs.NotificationProviderDTOs;
using DBGuardAPI.Data.Models.ServiceProviders;
using DBGuardAPI.Data.Enums;
namespace DBGuardAPI.Helpers
{
    public static class NotificationProviderHelper
    {
        public static NotificationProviderDTO MapToDTO(NotificationProvider provider) // Maps a generic notification provider to correct provider dto
        {
            return provider switch
            {
                EmailProvider email => new EmailProviderDTO
                {
                    Id = email.Id,
                    ProviderType = NotificationType.Email,
                    SMTPServer = email.SMTPServer,
                    Username = email.Username,
                    Port = email.Port
                },
                TextProvider text => new TextProviderDTO
                {
                    Id = text.Id,
                    ProviderType = NotificationType.Text,
                    PhoneNumber = text.PhoneNumber
                },
                _ => throw new InvalidOperationException()
            };
        }
    }
}
