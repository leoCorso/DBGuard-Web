using DBGuardAPI.Data.DTOs.NotificationProviderDTOs;
using DBGuardAPI.Data.DTOs.NotificationsDTOs;
using DBGuardAPI.Data.Models.GuardNotifications;
using DBGuardAPI.Data.Models.ServiceProviders;

namespace DBGuardAPI.Helpers
{
    public static class GuardNotificationHelper
    {
        public static GuardNotification MapToEntity(CreateNotificationDTO newNotification)
        {
            return newNotification switch
            {
                CreateEmailNotificationDTO emailNotification => new EmailNotification
                {
                    NotificationProviderId = newNotification.NotificationProvider.Id,
                    EmailSubject = emailNotification.EmailSubject.Trim(),
                    EmailBody = emailNotification.EmailBody.Trim(),
                    ToEmails = GuardNotificationHelper.ParseEmailContacts(emailNotification.Emails).Where(email => email.Type == "to").Select(email => email.EmaiLAddress).ToList(),
                    CCEmails = GuardNotificationHelper.ParseEmailContacts(emailNotification.Emails).Where(email => email.Type == "cc").Select(email => email.EmaiLAddress).ToList(),
                    BCCEmails = GuardNotificationHelper.ParseEmailContacts(emailNotification.Emails).Where(email => email.Type == "bcc").Select(email => email.EmaiLAddress).ToList()
                },
                CreateTextGuardNotificationDTO textNotification => new TextNotification
                {
                    NotificationProviderId = newNotification.NotificationProvider.Id,
                    PhoneNumbers = textNotification.PhoneNumbers,
                    TextMessage = textNotification.TextMessage
                },
                _ => throw new NotSupportedException($"Type {newNotification.NotificationType} is not yet supported")
            };
        }

        public static CreateNotificationDTO MapToCreateDTO(GuardNotification guardNotification) // Maps a generic notification to correct notification dto
        {
            return guardNotification switch
            {
                EmailNotification email => new CreateEmailNotificationDTO
                {
                    Id = email.Id,
                    GuardId = email.GuardId,
                    EmailSubject = email.EmailSubject,
                    EmailBody = email.EmailBody,
                    Emails = GuardNotificationHelper.StringifyEmailContacts(email.ToEmails, email.CCEmails, email.BCCEmails),
                    NotificationProvider = NotificationProviderHelper.MapToDTO(email.NotificationProvider!)
                },
                TextNotification text => new CreateTextGuardNotificationDTO
                {
                    Id = text.Id,
                    PhoneNumbers = text.PhoneNumbers,
                    TextMessage = text.TextMessage,
                    NotificationProvider = NotificationProviderHelper.MapToDTO(text.NotificationProvider!)
                },
                _ => throw new InvalidOperationException()
            };
        }
        public static NotificationDetailDTO MapToDetailDTO(GuardNotification guardNotification)
        {
            return guardNotification switch
            {
                EmailNotification emailDetail => new EmailNotificationDetailDTO
                {
                    Id = emailDetail.Id,
                    GuardId = emailDetail.GuardId,
                    NotificationType = emailDetail.NotificationType,
                    NotificationProviderId = emailDetail.NotificationProviderId,
                    CreateDate = emailDetail.CreateDate,
                    LastEdited = emailDetail.LastEdited,
                    EmailSubject = emailDetail.EmailSubject,
                    EmailBody = emailDetail.EmailBody,
                    ToEmails = emailDetail.ToEmails,
                    CCEmails = emailDetail.CCEmails,
                    BCCEmails = emailDetail.BCCEmails,
                    CreatedByUserId = emailDetail.Guard!.CreatedByUserId,
                    CreatedByUsername = emailDetail.Guard.CreatedByUser!.UserName!
                },
                _ => throw new NotSupportedException("This notification type is not supported")
            };
        }
        private static List<EmailContact> ParseEmailContacts(List<string> emails)
        {
            // Element in emails is type:email
            List<EmailContact> contacts = [];
            string[] types = ["to", "cc", "bcc"];
            foreach (string email in emails)
            {
                string[] emailParts = email.Split(':');
                if(emailParts.Length == 2)
                {
                    if (types.Contains(emailParts[0]))
                    {
                        contacts.Add(new()
                        {
                            Type = emailParts[0],
                            EmaiLAddress = emailParts[1]
                        });
                    }
                    else
                    {
                        throw new InvalidDataException($"The email type could not be parsed ({emailParts[0]})");
                    }
                }
                else
                {
                    throw new InvalidDataException($"The email string could not be parsed ({email})");
                }
            }
            return contacts;
        }
        private static List<string> StringifyEmailContacts(List<string> toEmails, List<string> ccEmails, List<string> bccEmails)
        {
            return toEmails.Select(to => $"to:{to}")
                .Concat(ccEmails.Select(cc => $"cc:{cc}"))
                .Concat(bccEmails.Select(bcc => $"bcc:{bcc}"))
                .ToList();
        }
        public static void EditNotificationValues(GuardNotification notificationToEdit, CreateNotificationDTO newNotificationValues) // Takes two notifications and edits the value. Used to edit EF core entity items
        {
            switch (notificationToEdit)
            {
                case EmailNotification emailNotification when newNotificationValues is CreateEmailNotificationDTO editedEmail: // When 
                    
                    emailNotification.EmailSubject = editedEmail.EmailSubject;
                    emailNotification.EmailBody = editedEmail.EmailBody;
                    emailNotification.ToEmails = GuardNotificationHelper.ParseEmailContacts(editedEmail.Emails).Where(email => email.Type == "to").Select(email => email.EmaiLAddress).ToList();
                    emailNotification.CCEmails = GuardNotificationHelper.ParseEmailContacts(editedEmail.Emails).Where(email => email.Type == "cc").Select(email => email.EmaiLAddress).ToList();
                    emailNotification.BCCEmails = GuardNotificationHelper.ParseEmailContacts(editedEmail.Emails).Where(email => email.Type == "bcc").Select(email => email.EmaiLAddress).ToList();
                    break;
                // Handle other types
                default:
                    throw new NotSupportedException($"Notification type {newNotificationValues.NotificationType} is not supported");
            }
        }
    }
}
