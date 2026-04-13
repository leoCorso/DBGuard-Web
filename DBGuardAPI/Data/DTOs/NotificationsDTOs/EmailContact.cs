namespace DBGuardAPI.Data.DTOs.NotificationsDTOs
{
    public class EmailContact
    {
        public required string EmaiLAddress { get; set; }
        public required string Type { get; set; } // To, CC, BCC
    }
}
