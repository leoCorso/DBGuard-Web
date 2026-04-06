namespace DBGuardAPI.Data.Models.NotificationTransactions
{
    public class TextNotificationTransaction: NotificationTransaction
    {
        public required string PhoneNumbers { get; set; }
        public required string TextMessage { get; set; }
    }
}
