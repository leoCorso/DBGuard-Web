using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.Data
{
    public class GuardView
    {
        public int Id { get; set; }
        public string? GuardName { get; set; }
        public DateTimeOffset CreateDate { get; set; }
        public DateTimeOffset LastRun { get; set; }
        public required string CreatedByUserId { get; set; }
        public required string UserName { get; set; }
        public required string CountColumn { get; set; }
        public GuardOperator TriggerOperator { get; set; }
        public int TriggerValue { get; set; }
        public int DatabaseConnectionId { get; set; }
        public required string EndPoint { get; set; }
        public DatabaseEngine DatabaseEngine { get; set; }
        public required string DatabaseName { get; set; }
        public GuardState GuardState { get; set; }
        public bool IsActive { get; set; }
        public int TotalErrors { get; set; }
        public int TotalTriggers { get; set; }
        public double RunPeriodInMinutes { get; set; }
    }
}
