using System.Net;
using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.Data.Models.NotificationTransactions
{
    public class HTTPNotificationTransaction : NotificationTransaction
    {
        public required string URL { get; set; }
        public HTTPAction HttpMethod { get; set; }
        public Dictionary<string, string?> RequestHeaders { get; set; } = [];
        public Dictionary<string, string?> QueryParameters { get; set; } = [];
        public HTTPBodyType? BodyType { get; set; }
        public string? BodyData { get; set; }
        public HttpStatusCode? ResponseCode { get; set; }
        public string? ResponseMessage { get; set; }
    }
}
