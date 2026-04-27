using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.Data.DTOs.DatabaseConnectionDTOs
{
    public class CreateDatabaseConnectionDTO
    {
        public int? Id { get; set; }
        public required string Endpoint { get; set; }
        public DatabaseEngine DatabaseEngine { get; set; }
        public required string DatabaseName { get; set; }
        public string? Username { get; set; }
        public string? Password { get; set; }
        public bool ValidateConnection { get; set; } = true;
    }
}
