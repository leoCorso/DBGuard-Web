using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.Data.DTOs.GuardDTOs
{
    public class GuardDetailDTO
    {
        public int Id { get; set; }
        public string? GuardName { get; set; }
        public string? GuardDescription { get; set; }
        public DateTimeOffset CreateDate { get; set; }
        public DateTimeOffset? LastRun { get; set; }
        public DateTimeOffset LastEditedDate { get; set; }
        public required string CreatedByUserId { get; set; }
        public required string UserName { get; set; }
        public required string TriggerQuery { get; set; }
        public required string CountColumn { get; set; }
        public GuardOperator TriggerOperator { get; set; }
        public int TriggerValue { get; set; }
        public GuardState GuardState { get; set; }
        public bool IsActive { get; set; }
        public bool NotifyOnClear { get; set; }
        public bool NotifyOnError { get; set; }
        public bool NotifyOnTrigger { get; set; }
        public int TotalErrors { get; set; }
        public int TotalTriggers { get; set; }
        public double RunPeriodInMinutes { get; set; }
        public int DatabaseConnectionId { get; set; }
    }
}
