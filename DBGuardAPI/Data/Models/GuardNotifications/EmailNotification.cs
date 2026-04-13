namespace DBGuardAPI.Data.Models.GuardNotifications
{
    public class EmailNotification: GuardNotification
    {
        public required string EmailSubject { get; set; }
        public required string EmailBody { get; set; }
        public List<string> ToEmails { get; set; } = [];
        public List<string> CCEmails { get; set; } = [];
        public List<string> BCCEmails { get; set; } = [];
    }
}
