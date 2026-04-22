namespace DBGuardAPI.Data.DTOs.AuthDTOs
{
    public class RefreshTokenRequest
    {
        public required string UserId { get; set; }
        public required string RefreshToken { get; set; }
    }
}
