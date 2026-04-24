using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.Data.DTOs.DatabaseConnectionDTOs
{
    public class SimpleDatabaseConnectionDTO
    {
        public int Id { get; set; }
        public required string Endpoint { get; set; }
        public DatabaseEngine DatabaseEngine { get; set; }
        public required string DatabaseName { get; set; }
        public string? Username { get; set; }
    }
}
