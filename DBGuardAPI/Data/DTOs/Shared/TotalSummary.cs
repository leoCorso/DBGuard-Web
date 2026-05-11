namespace DBGuardAPI.Data.DTOs.Shared
{
    public class TotalSummary
    {
        public int TotalGuards { get; set; }
        public int TotalGuardChanges { get; set; }
        public int TotalNotificationsSent { get; set; }
        public int TotalProviders { get; set; }
        public int TotalDatabaseConnections { get; set; }
        public int TotalUsers { get; set; }
    }
}
