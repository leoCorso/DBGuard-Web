using DBGuardAPI.Data.DTOs.NotificationProviderDTOs;
using DBGuardAPI.Data.Models.ServiceProviders;
using DBGuardAPI.Data.Enums;
using System.Security.Cryptography.X509Certificates;
using DBGuardAPI.Data.Models.NotificationProviders;
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
                    NotificationType = email.ProviderType,
                    CreateDate = email.CreateDate,
                    LastEdited = email.LastEditedDate,
                    CreatedByUserId = email.CreatedByUserId,
                    CreatedByUsername = email.CreatedByUser?.UserName!,
                    SMTPServer = email.SMTPServer,
                    Username = email.Username,
                    Port = email.Port,
                    SenderEmail = email.SenderEmail
                },
                HTTPProvider http => new HTTPProviderDTO
                {
                    Id = http.Id,
                    NotificationType = http.ProviderType,
                    CreateDate = http.CreateDate,
                    LastEdited = http.LastEditedDate,
                    CreatedByUserId = http.CreatedByUserId,
                    CreatedByUsername = http.CreatedByUser?.UserName!
                },
                _ => throw new InvalidOperationException()
            };
        }
    }
}
