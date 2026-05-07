using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.Data.Models.GuardNotifications
{
    public class HTTPNotification: GuardNotification
    {
        public required string URL { get; set; }
        public HTTPAction HttpMethod { get; set; }
        public Dictionary<string, string?> RequestHeaders { get; set; } = [];
        public Dictionary<string, string?> QueryParameters { get; set; } = [];
        public HTTPBodyType? BodyType { get; set; } // The body type
        public string? BodyData { get; set; } // The body data
    }
}
