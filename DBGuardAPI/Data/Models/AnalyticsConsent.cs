using System.Net;

namespace DBGuardAPI.Data.Models
{
    public class AnalyticsConsent
    {
        public int Id { get; set; }
        public DateTimeOffset Timetsamp { get; set; } = DateTimeOffset.UtcNow;
        public IPAddress? IPAddress { get; set; }
        public string? UserAgent { get; set; }
        public bool IsGranted { get; set; }
        public string? UserId { get; set; }
        public User? User { get; set; }
    }
}
