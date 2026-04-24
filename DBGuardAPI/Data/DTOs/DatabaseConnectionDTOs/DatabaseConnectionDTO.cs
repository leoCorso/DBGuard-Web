using DBGuardAPI.Data.Enums;
using Sieve.Attributes;

namespace DBGuardAPI.Data.DTOs.DatabaseConnectionDTOs
{
    public class DatabaseConnectionDTO
    {
        [Sieve(CanSort = true, CanFilter = true)]
        public int Id { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public required string Endpoint { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public DatabaseEngine DatabaseEngine { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public required string DatabaseName { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public string? Username { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public string? Password { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public DateTimeOffset CreateDate { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public DateTimeOffset LastEdited { get; set; }
        public required string CreatedByUserId { get; set; }
        [Sieve(CanSort = true, CanFilter = true)]
        public required string CreatedByUsername { get; set; }
    }
}
