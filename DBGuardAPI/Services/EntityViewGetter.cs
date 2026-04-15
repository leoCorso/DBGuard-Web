using DBGuardAPI.Data.DTOs.RequestResponseDTOs;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace DBGuardAPI.Services
{
    public class EntityViewGetter
    {
        private readonly SieveProcessor _sieveProcessor;
        public EntityViewGetter(SieveProcessor sieveProcessor)
        {
            _sieveProcessor = sieveProcessor;
        }
        public async Task<PagedResponseDTO<T>> GetPagedResponseAsync<T>(SieveModel sieveParams, IQueryable<T> query)
        {
            IQueryable<T> queryWithFilterAndSort = _sieveProcessor.Apply(sieveParams, query, applyFiltering: true, applySorting: true, applyPagination: false);
            int totalItems = await queryWithFilterAndSort.CountAsync();
            int totalPages = (int)Math.Ceiling((double)totalItems / sieveParams.PageSize!.Value);
            IQueryable<T> paginatedItems = _sieveProcessor.Apply(sieveParams, queryWithFilterAndSort, applyFiltering: false, applyPagination: true, applySorting: false);
            List<T> dataItems = await paginatedItems.ToListAsync();
            return new PagedResponseDTO<T>
            {
                DataItems = dataItems,
                TotalItems = totalItems,
                TotalPages = totalPages,
                PageNumber = sieveParams.Page!.Value,
                PageSize = sieveParams.PageSize.Value,
            };
        }
    }
}
