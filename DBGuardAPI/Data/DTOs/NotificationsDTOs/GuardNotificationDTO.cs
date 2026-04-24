using DBGuardAPI.Data.Enums;
using Sieve.Attributes;

namespace DBGuardAPI.Data.DTOs.NotificationsDTOs
{
    public class GuardNotificationDTO
    {
        [Sieve(CanSort = true, CanFilter = true)]
        public int Id { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public int GuardId { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public NotificationType NotificationType { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public DateTimeOffset CreateDate { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public DateTimeOffset LastEdited { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public int NotificationProviderId { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public required string CreatedByUserId { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public required string CreatedByUsername { get; set; }
    }
}
