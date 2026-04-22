using DBGuardAPI.Data.DTOs.NotificationProviderDTOs;
using DBGuardAPI.Data.Models.ServiceProviders;
using DBGuardAPI.Data.Enums;
using System.Security.Cryptography.X509Certificates;
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
                    SMTPServer = email.SMTPServer,
                    Username = email.Username,
                    Port = email.Port
                },
                TextProvider text => new TextProviderDTO
                {
                    Id = text.Id,
                    PhoneNumber = text.PhoneNumber
                },
                _ => throw new InvalidOperationException()
            };
        }
    }
}
