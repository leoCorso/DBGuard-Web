using System.Security.Cryptography.X509Certificates;
using DBGuardAPI.Data.Models.ServiceProviders;
using Microsoft.AspNetCore.Identity;

namespace DBGuardAPI.Data.Models
{
    public class User: IdentityUser
    {
        public bool IsActive { get; set; } = true;
        public DateTimeOffset CreateDate { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset LastEdited { get; set; } = DateTimeOffset.UtcNow;
        public string? CreatedByUserId { get; set; }
        public User? CreatedByUser { get; set; }
        public ICollection<Guard> Guards { get; set; } = [];
        public ICollection<User> CreatedUsers { get; set; } = [];
        public ICollection<DatabaseConnection> DatabaseConnections { get; set; } = [];
        public ICollection<NotificationProvider> NotificationProviders { get; set; } = [];
    }
}
