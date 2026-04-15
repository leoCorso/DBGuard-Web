namespace DBGuardAPI.Data.DTOs.RequestResponseDTOs
{
    public class PagedResponseDTO<T>
    {
        public List<T> DataItems { get; set; } = [];
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }
}
