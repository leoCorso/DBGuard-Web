using DBGuardAPI.Data.DTOs.DatabaseConnectionDTOs;
using DBGuardAPI.Data.DTOs.NotificationsDTOs;
using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.Data.DTOs.GuardDTOs
{
    public class CreateGuardDTO
    {
        public int? Id { get; set; }
        public string? GuardName { get; set; }
        public string? GuardDescription { get; set; }
        public required string TriggerQuery { get; set; }
        public required string CountColumn { get; set; }
        public GuardOperator TriggerOperator { get; set; }
        public int TriggerValue { get; set; }
        public required SimpleDatabaseConnectionDTO DatabaseConnection { get; set; }
        public bool IsActive { get; set; }
        public bool NotifyOnClear { get; set; }
        public bool NotifyOnError { get; set; }
        public bool NotifyOnTrigger { get; set; }
        public double RunPeriodInMinutes { get; set; }
        public List<CreateNotificationDTO> Notifications { get; set; } = [];
    }
}
