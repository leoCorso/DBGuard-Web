using DBGuardAPI.Data.Enums;
using DBGuardAPI.Data.Models.NotificationTransactions;

namespace DBGuardAPI.Data.Models
{
    public class GuardChangeTransaction
    {
        public int Id { get; set; }
        public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;
        public int? GuardId { get; set; }
        public GuardState GuardState { get; set; }
        public GuardState PreviousGuardState { get; set; }
        public required string GuardQuery { get; set; }
        public GuardOperator GuardOperator { get; set; }
        public int GuardValue { get; set; }
        public int? ResultValue { get; set; } // The value of result set which triggered or untriggered query
        public string? Message { get; set; } //  Message log
        public int? DatabaseConnectionId { get; set; }
        public required string DatabaseConnectionEndPoint { get; set; }
        public DatabaseEngine DatabaseConnectionEngine { get; set; }
        public required string DatabaseName { get; set; }
        public required string DatabaseConnectionUsername { get; set; }
        public Guard? Guard { get; set; }
        public DatabaseConnection? DatabaseConnection { get; set; }
        public ICollection<NotificationTransaction> NotificationTransactions { get; set; } = [];
    }
}
