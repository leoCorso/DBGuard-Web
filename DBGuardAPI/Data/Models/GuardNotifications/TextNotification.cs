namespace DBGuardAPI.Data.Models.GuardNotifications
{
    public class TextNotification: GuardNotification
    {
        public List<string> PhoneNumbers { get; set; } = [];
        public required string TextMessage { get; set; }
    }
}
