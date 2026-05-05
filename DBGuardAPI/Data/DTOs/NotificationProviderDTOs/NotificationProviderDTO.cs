using System.Text.Json.Serialization;
using DBGuardAPI.Data.Enums;
using Sieve.Attributes;

namespace DBGuardAPI.Data.DTOs.NotificationProviderDTOs
{
    [JsonPolymorphic(TypeDiscriminatorPropertyName = "providerType")]
    [JsonDerivedType(typeof(EmailProviderDTO), (int)NotificationType.Email)]
    [JsonDerivedType(typeof(HTTPProviderDTO), (int)NotificationType.HTTP)]
    public class NotificationProviderDTO
    {
        [Sieve(CanSort = true, CanFilter = true)]
        public int Id { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public NotificationType NotificationType { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public DateTimeOffset CreateDate { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public DateTimeOffset LastEdited { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public string? CreatedByUserId { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public string? CreatedByUsername { get; set; }

    }
    public class EmailProviderDTO : NotificationProviderDTO
    {
        public required string SMTPServer { get; set; }
        public required string Username { get; set; }
        public int Port { get; set; }
        public string? Password { get; set; }
        public required string SenderEmail { get; set; }
    }
    public class HTTPProviderDTO: NotificationProviderDTO
    {
        public HTTPAction HTTPActionType { get; set; }
    }
}
