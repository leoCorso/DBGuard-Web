namespace DBGuardAPI.Data.DTOs.AuthDTOs
{
    public class AuthResult
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public string? AccessToken { get; set; }
        public DateTime? Expiration { get; set; }
        public string? Username { get; set; }
        public List<string> Roles { get; set; } = [];
    }
}
