namespace DBGuardAPI.Data.Models
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public required string UserId { get; set; }
        public required string Token { get; set; }
        public DateTime Expires { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsRevoked { get; set; } = false;
        public User? User { get; set; }
    }
}
