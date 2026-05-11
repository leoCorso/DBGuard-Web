using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.Data.DTOs.GuardDTOs
{
    public class GuardChangeDataRequestDTO
    {
        public DateTime Year { get; set; }
    }
    public class GuardChangeItemDTO
    {
        public required string Month { get; set; }
        public GuardState GuardState { get; set; }
        public int Count { get; set; }
    }
}
