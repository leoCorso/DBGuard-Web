using DBGuardAPI.Data.Enums;
using Sieve.Attributes;

namespace DBGuardAPI.Data.DTOs.GuardDTOs
{
    public class GuardChangeTransactionDTO
    {
        [Sieve(CanSort = true, CanFilter = true)]
        public int Id { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public DateTimeOffset Timestamp { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public int? GuardId { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public GuardState GuardState { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public GuardState PreviousGuardState { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public required string GuardQuery { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public GuardOperator GuardOperator { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public int GuardValue { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public int? DatabaseConnectionId { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public required string DatabaseConnectionEndpoint { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public required string DatabaseName { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public DatabaseEngine DatabaseConnectionEngine { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public required string DatabaseConnectionUsername { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public int? ResultValue { get; set; }
    }
}
