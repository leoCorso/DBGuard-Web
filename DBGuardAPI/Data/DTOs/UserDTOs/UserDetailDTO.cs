namespace DBGuardAPI.Data.DTOs.UserDTOs
{
    public class UserDetailDTO
    {
        public required string Id { get; set; }
        public required string Username { get; set; }
        public string? CreatedByUserId { get; set; }
        public string? CreatedByUsername { get; set; }
        public DateTimeOffset CreateDate { get; set; }
        public DateTimeOffset LastEdited { get; set; }
        public List<string> Roles { get; set; } = [];
    }
}
