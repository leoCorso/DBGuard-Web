using DBGuardAPI.Data.DTOs.NotificationsDTOs;
using DBGuardAPI.Data.Models.GuardNotifications;

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
                    EmailSubject = emailNotification.EmailSubject,
                    EmailBody = emailNotification.EmailBody,
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
    }
}
