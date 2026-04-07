namespace DBGuardAPI.Data.DTOs.AuthDTOs
{
    public class LoginResult
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public string? Token { get; set; }
    }
}
