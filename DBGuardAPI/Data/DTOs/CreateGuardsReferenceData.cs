using DBGuardAPI.Data.DTOs.DatabaseConnectionDTOs;
using DBGuardAPI.Data.DTOs.NotificationProviderDTOs;

namespace DBGuardAPI.Data.DTOs
{
    public class CreateGuardsReferenceData
    {
        public List<DatabaseConnectionDTO> DatabaseConnections { get; set; } = [];
        public List<NotificationProviderDTO> NotificationProviders { get; set; } = [];
    }
}
