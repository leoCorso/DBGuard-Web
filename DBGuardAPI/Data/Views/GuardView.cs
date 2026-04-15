using DBGuardAPI.Data.Enums;
using Sieve.Attributes;

namespace DBGuardAPI.Data.Views
{
    public class GuardView
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
        public required string CreatedByUserId { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public required string UserName { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public required string CountColumn { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public GuardOperator TriggerOperator { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public int TriggerValue { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public int DatabaseConnectionId { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public required string EndPoint { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public DatabaseEngine DatabaseEngine { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public required string DatabaseName { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public GuardState GuardState { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public bool IsActive { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public int TotalErrors { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public int TotalTriggers { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public double RunPeriodInMinutes { get; set; }
    }
}
