using DBGuardAPI.Data.Models.ServiceProviders;
using Microsoft.AspNetCore.Identity;

namespace DBGuardAPI.Data.Models
{
    public class User: IdentityUser
    {
        public bool IsActive { get; set; } = true;
        public ICollection<Guard> Guards { get; set; } = [];
        public ICollection<DatabaseConnection> DatabaseConnections { get; set; } = [];
        public ICollection<NotificationProvider> NotificationProviders { get; set; } = [];
    }
}
