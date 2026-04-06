namespace DBGuardAPI.Data.Models.GuardNotifications
{
    public class TextNotification: GuardNotification
    {
        public required string PhoneNumbers { get; set; }
        public required string TextMessage { get; set; }
    }
}
