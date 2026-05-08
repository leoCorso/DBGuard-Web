namespace DBGuardAPI.Data.DTOs.UserDTOs
{
    public class EditSelfPasswordDTO
    {
        public required string Id { get; set; }
        public required string CurrentPassword { get; set; }
        public required string NewPassword { get; set; }
        public required string ConfirmNewPassword { get; set; }
    }
}
