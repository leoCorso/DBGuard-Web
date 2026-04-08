namespace DBGuardAPI.Data.DTOs.NotificationProviderDTOs
{
    public class EmailProviderDTO: NotificationProviderDTO
    {
        public required string SMTPServer { get; set; }
        public required string Username { get; set; }
        public int Port { get; set; }
    }
}
