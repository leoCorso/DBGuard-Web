using DBGuardAPI.Data.DTOs.NotificationProviderDTOs;
using DBGuardAPI.Data.DTOs.NotificationsDTOs;
using DBGuardAPI.Data.Enums;
using DBGuardAPI.Data.Models.GuardNotifications;
using DBGuardAPI.Data.Models.ServiceProviders;

namespace DBGuardAPI.Helpers
{
    public static class GuardNotificationHelper
    {
        public static NotificationType[] SystemNotificationTypes { get; } = [NotificationType.HTTP]; // The notification types that are system generated.

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
                CreateHttpNotificationDTO httpNotififcation => new HTTPNotification 
                {
                    NotificationProviderId = httpNotififcation.NotificationProvider.Id,
                    URL = httpNotififcation.URL,
                    HttpMethod = httpNotififcation.ActionType,
                    RequestHeaders = httpNotififcation.RequestHeaders,
                    QueryParameters = httpNotififcation.QueryParams,
                    BodyType = httpNotififcation.BodyType,
                    BodyData = httpNotififcation.BodyData
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
                    NotificationType = email.NotificationType,
                    Emails = GuardNotificationHelper.StringifyEmailContacts(email.ToEmails, email.CCEmails, email.BCCEmails),
                    NotificationProvider = NotificationProviderHelper.MapToDTO(email.NotificationProvider!)
                },
                HTTPNotification http => new CreateHttpNotificationDTO
                {
                    Id = http.Id,
                    GuardId = http.GuardId,
                    NotificationType = http.NotificationType,
                    URL = http.URL,
                    ActionType = http.HttpMethod,
                    RequestHeaders = http.RequestHeaders,
                    QueryParams = http.QueryParameters,
                    BodyType = http.BodyType,
                    BodyData = http.BodyData,
                    NotificationProvider = NotificationProviderHelper.MapToDTO(http.NotificationProvider!)
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
                HTTPNotification httpDetail => new HttpNotificationDetailDTO
                {
                    Id = httpDetail.Id,
                    GuardId = httpDetail.GuardId,
                    NotificationType = httpDetail.NotificationType,
                    NotificationProviderId = httpDetail.NotificationProviderId,
                    CreateDate = httpDetail.CreateDate,
                    LastEdited = httpDetail.LastEdited,
                    URL = httpDetail.URL,
                    HttpMethod = httpDetail.HttpMethod,
                    RequestHeaders = httpDetail.RequestHeaders,
                    QueryParameters = httpDetail.QueryParameters,
                    BodyType = httpDetail.BodyType,
                    BodyData = httpDetail.BodyData,
                    CreatedByUserId = httpDetail.Guard!.CreatedByUserId,
                    CreatedByUsername = httpDetail.Guard.CreatedByUser!.UserName!
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
                case HTTPNotification httpNotification when newNotificationValues is CreateHttpNotificationDTO editedHttp:
                    httpNotification.URL = editedHttp.URL;
                    httpNotification.RequestHeaders = editedHttp.RequestHeaders;
                    httpNotification.QueryParameters = editedHttp.QueryParams;
                    httpNotification.BodyType = editedHttp.BodyType;
                    httpNotification.BodyData = editedHttp.BodyData;
                    httpNotification.HttpMethod = editedHttp.ActionType;
                    break;
                // Handle other types
                default:
                    throw new NotSupportedException($"Notification type {newNotificationValues.NotificationType} is not supported");
            }
        }
    }
}
