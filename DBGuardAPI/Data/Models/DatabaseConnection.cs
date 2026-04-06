using System.Net;
using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.Data.Models
{
    public class DatabaseConnection
    {
        public int Id { get; set; }
        public required string EndPoint { get; set; }
        public DatabaseEngine DatabaseEngine { get; set; }
        public required string DatabaseName { get; set; }
        public string? Username { get; set; }
        public string? Password { get; set; }
        public DateTimeOffset CreateDate { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset LastEditedDate { get; set; } = DateTimeOffset.UtcNow;
        public required string CreatedByUserId { get; set; }
        public User? CreatedByUser { get; set; }
        public ICollection<Guard> Guards { get; set; } = [];
        public ICollection<GuardChangeTransaction> GuardChangeTransactions { get; set; } = [];
    }
}