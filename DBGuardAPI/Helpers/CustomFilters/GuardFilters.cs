using DBGuardAPI.Data.Enums;
using DBGuardAPI.Data.Views;
using Sieve.Services;

namespace DBGuardAPI.Helpers.CustomFilters
{
    public class GuardFilters: ISieveCustomFilterMethods
    {
        public IQueryable<GuardView> HasGuardState(IQueryable<GuardView> source, string op, GuardState[] values)
        {
            return source.Where(guard => values.Contains(guard.GuardState));
        }
    }
}
