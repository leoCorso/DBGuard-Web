using System.Security.Cryptography;
using DBGuardAPI.Data.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DBGuardAPI.Services
{
    public class RefreshTokenService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<User> _userManager;
        private readonly ApplicationDbContext _dbContext;
        public RefreshTokenService(IConfiguration configuration, UserManager<User> userManager, ApplicationDbContext dbContext)
        {
            _configuration = configuration;
            _userManager = userManager;
            _dbContext = dbContext;
        }
        public async Task<RefreshToken> GenerateRefreshToken(User user)
        {
            string token = GenerateTokenString();
            RefreshToken newToken = new()
            {
                UserId = user.Id,
                Token = token,
                CreatedAt = DateTime.UtcNow,
                Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["JwtSettings:RefreshTokenExpirationInMinutes"]))
            };
            await _dbContext.RefreshTokens.AddAsync(newToken);
            await _dbContext.SaveChangesAsync();
            return newToken;
        }
        private string GenerateTokenString()
        {
            byte[] bytes = RandomNumberGenerator.GetBytes(64);
            string refreshToken = Convert.ToBase64String(bytes);
            return refreshToken;
        }
        public async Task<RefreshToken?> GetRefreshToken(string token)
        {
            RefreshToken? refreshToken = await _dbContext.RefreshTokens.Where(rt => !rt.IsRevoked && rt.Expires > DateTimeOffset.UtcNow && rt.Token == token).FirstOrDefaultAsync();
            return refreshToken;
        }
        public async Task RevokeRefreshToken(string token)
        {
            RefreshToken? refreshToken = await _dbContext.RefreshTokens.Where(rt => rt.Token == token).FirstOrDefaultAsync();
            if (refreshToken is null)
            {
                return;
            }
            refreshToken.IsRevoked = true;
            _dbContext.RefreshTokens.Update(refreshToken);
            await _dbContext.SaveChangesAsync();
        }
    }
}
