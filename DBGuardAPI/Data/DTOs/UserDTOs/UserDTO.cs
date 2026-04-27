using Sieve.Attributes;

namespace DBGuardAPI.Data.DTOs.UserDTOs
{
    public class UserDTO
    {
        [Sieve(CanFilter = true, CanSort = true)]
        public required string Id { get; set; }
        [Sieve(CanFilter = true, CanSort = true)]
        public required string Username { get; set; }
        [Sieve(CanFilter = true, CanSort = true)]
        public DateTimeOffset CreateDate { get; set; }
        [Sieve(CanFilter = true, CanSort = true)]
        public DateTimeOffset LastEdited { get; set; }
        [Sieve(CanFilter = true, CanSort = true)]
        public string? CreatedByUserId { get; set; }
        [Sieve(CanFilter = true, CanSort = true)]
        public string? CreatedByUsername { get; set; }
    }
}
