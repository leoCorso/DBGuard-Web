using System.Text.RegularExpressions;

namespace DBGuardAPI.Helpers
{
    public static class PasswordValidator
    {
        // One uppercase, one lowercase, one special char, and one digit, min 8 length
        private static readonly Regex PasswordRequirements = new(
            @"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$",
            RegexOptions.Compiled
        );
        public static bool IsValidPassword(string password) =>
            !string.IsNullOrEmpty(password) && PasswordRequirements.IsMatch(password);
    }
}
