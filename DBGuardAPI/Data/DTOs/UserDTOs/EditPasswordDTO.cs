namespace DBGuardAPI.Data.DTOs.UserDTOs
{
    public class EditPasswordDTO
    {
        public required string CurrentPassword { get; set; }
        public required string NewPassword { get; set; }
        public required string ConfirmNewPassword { get; set; }
    }
}
