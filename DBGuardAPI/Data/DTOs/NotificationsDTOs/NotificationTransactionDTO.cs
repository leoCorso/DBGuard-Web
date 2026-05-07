using System.Net;
using System.Text.Json.Serialization;
using DBGuardAPI.Data.DTOs.NotificationProviderDTOs;
using DBGuardAPI.Data.Enums;
using Sieve.Attributes;

namespace DBGuardAPI.Data.DTOs.NotificationsDTOs
{
    [JsonPolymorphic(TypeDiscriminatorPropertyName = "NotificationType")]
    [JsonDerivedType(typeof(EmailNotificationTransactionDTO), (int)NotificationType.Email)]
    [JsonDerivedType(typeof(HttpNotificationTransactionDTO), (int)NotificationType.HTTP)]

    public class NotificationTransactionDTO
    {
        [Sieve(CanSort = true, CanFilter = true)]
        public int Id { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public DateTimeOffset Timestamp { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public int? GuardId { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public int? GuardNotificationId { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public NotificationType NotificationType { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public int GuardChangeTransactionId { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public bool Successful { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public string? ErrorMessage { get; set; }
    }
    public class EmailNotificationTransactionDTO : NotificationTransactionDTO
    {
        public required string EmailSubject { get; set; }
        public required string EmailBody { get; set; }
        public List<string> ToEmails { get; set; } = [];
        public List<string> CcEmails { get; set; } = [];
        public List<string> BccEmails { get; set; } = [];
    }
    public class HttpNotificationTransactionDTO: NotificationTransactionDTO
    {
        public required string URL { get; set; }
        public HTTPAction HttpMethod { get; set; }
        public Dictionary<string, string?> RequestHeaders { get; set; } = [];
        public Dictionary<string, string?> QueryParameters { get; set; } = [];
        public HTTPBodyType? BodyType { get; set; }
        public string? BodyData { get; set; }
        public HttpStatusCode? ResponseCode { get; set; }
        public string? ResponseMessage { get; set; }
    }
}
