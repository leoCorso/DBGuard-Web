using DBGuardAPI.Data.Enums;
using Sieve.Attributes;

namespace DBGuardAPI.Data.DTOs.GuardDTOs
{
    public class GuardDTO
    {
        [Sieve(CanSort = true, CanFilter = true)]
        public int Id { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public string? GuardName { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public DateTimeOffset CreateDate { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public DateTimeOffset? LastRun { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public DateTimeOffset LastEditedDate { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public required string CreatedByUserId { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public required string UserName { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public required string TriggerQuery { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public required string CountColumn { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public GuardOperator TriggerOperator { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public int TriggerValue { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public GuardState GuardState { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public bool IsActive { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public bool NotifyOnClear { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public bool NotifyOnError { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public bool NotifyOnTrigger { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public int TotalErrors { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public int TotalTriggers { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public double RunPeriodInMinutes { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public int DatabaseConnectionId { get; set; }
    }
}
