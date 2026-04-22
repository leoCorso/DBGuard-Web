using DBGuardAPI.Data.Enums;
using Sieve.Attributes;

namespace DBGuardAPI.Data.DTOs.NotificationsDTOs
{
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
    }
}
