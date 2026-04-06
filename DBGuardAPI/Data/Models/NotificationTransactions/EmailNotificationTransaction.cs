namespace DBGuardAPI.Data.Models.NotificationTransactions
{
    public class EmailNotificationTransaction: NotificationTransaction
    {
        public required string EmailSubject { get; set; }
        public required string EmailBody { get; set; }
        public required string ToEmails { get; set; }
        public string? CCEmails { get; set; }
        public string? BCCEmails { get; set; }
    }
}
