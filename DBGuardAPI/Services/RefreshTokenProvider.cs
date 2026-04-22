using System.Security.Cryptography;
using DBGuardAPI.Data.Models;
using Microsoft.AspNetCore.Identity;

namespace DBGuardAPI.Services
{
    public class RefreshTokenProvider: IUserTwoFactorTokenProvider<User>
    {
        public Task<string> GenerateAsync(string purpose, UserManager<User> manager, User user)
        {
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Task.FromResult(Convert.ToBase64String(randomBytes));
        }

        public async Task<bool> ValidateAsync(string purpose, string token, UserManager<User> manager, User user)
        {
            string? storedToken = await manager.GetAuthenticationTokenAsync(
                user, "RefreshTokenProvider", purpose);

            return storedToken == token;
        }

        public Task<bool> CanGenerateTwoFactorTokenAsync(UserManager<User> manager, User user)
            => Task.FromResult(false);
    }
}
