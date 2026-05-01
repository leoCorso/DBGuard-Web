using DBGuardAPI.Data.Enums;

namespace DBGuardAPI.Helpers
{
    public static class GuardStateColorMapper
    {
        public static string Map(GuardState state)
        {
            switch (state)
            {
                case GuardState.Clear:
                    return "green";
                case GuardState.Triggered:
                    return "yellow";
                case GuardState.Error:
                    return "red";
                default:
                    return "blue";
            }
        }
    }
}
