namespace DBGuardAPI.Data.DTOs.UserDTOs
{
    public class CreateUserDTO
    {
        public string? Id { get; set; }
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string ConfirmPassword { get; set; }
        public List<string> Roles { get; set; } = [];
    }
}
