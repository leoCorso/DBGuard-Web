namespace DBGuardAPI.Data.Models.ServiceProviders
{
    public class EmailProvider: NotificationProvider
    {
        public required string SMTPServer { get; set; }
        public required string Username { get; set; }
        public required string Password { get; set; }
        public int Port { get; set; } = 587;
        public required string SenderEmail { get; set; }

    }
}
