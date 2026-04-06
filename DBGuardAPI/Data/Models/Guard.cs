using DBGuardAPI.Data.Enums;
using DBGuardAPI.Data.Models.GuardNotifications;

namespace DBGuardAPI.Data.Models
{
    public class Guard
    {
        public int Id { get; set; }
        public string? GuardName { get; set; }
        public string? GuardDescription { get; set; }
        public DateTimeOffset CreateDate { get; set; } = DateTimeOffset.UtcNow;
        public required string CreatedByUserId { get; set; }
        public DateTimeOffset LastEditedDate { get; set; } = DateTimeOffset.UtcNow;
        public required string TriggerQuery { get; set; }
        public required string CountColumn { get; set; }
        public GuardOperator TriggerOperator { get; set; }
        public int TriggerValue { get; set; }
        public int DatabaseConnectionId { get; set; }
        public GuardState GuardState { get; set; } = GuardState.Unknown;
        public bool IsActive { get; set; } = true;  
        public bool NotifyOnClear { get; set; } = true;
        public bool NotifyOnError { get; set; } = true;
        public bool NotifyOnTrigger { get; set; } = true;
        public int TotalErrors { get; set; } = 0;
        public int TotalTriggers { get; set; } = 0;
        public DateTimeOffset? LastRun { get; set; }
        public double RunPeriodInMinutes { get; set; } = 1;
        public User? CreatedByUser { get; set; }
        public DatabaseConnection? DatabaseConnection { get; set; }
        public ICollection<GuardNotification> GuardNotifications { get; set; } = [];
        public ICollection<GuardChangeTransaction> GuardChangeTransactions { get; set; } = [];
    }
}
