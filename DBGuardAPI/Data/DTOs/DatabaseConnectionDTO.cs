using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.Data.DTOs
{
    public class DatabaseConnectionDTO
    {
        public int Id { get; set; }
        public required string Endpoint { get; set; }
        public DatabaseEngine DatabaseEngine { get; set; }
        public required string DatabaseName { get; set; }
        public string? Username { get; set; }
    }
}
