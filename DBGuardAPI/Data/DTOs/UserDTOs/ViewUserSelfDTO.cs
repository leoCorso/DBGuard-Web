namespace DBGuardAPI.Data.DTOs.UserDTOs
{
    public class ViewUserSelfDTO
    {
        public required string Id { get; set; }
        public required string Username { get; set; }
        public List<string> Roles { get; set; } = [];
    }
}
