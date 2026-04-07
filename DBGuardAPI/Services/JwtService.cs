using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DBGuardAPI.Data.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace DBGuardAPI.Services
{
    public class JwtService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<User> _userManager;
        private readonly ILogger<JwtService> _logger;
        public JwtService(IConfiguration configuration, UserManager<User> userManager, ILogger<JwtService> logger)
        {
            _configuration = configuration;
            _userManager = userManager;
            _logger = logger;
        }
        public async Task<JwtSecurityToken> GetTokenAsync(User user)
        {
            var jwt = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: await GetClaimsAsync(user),
                expires: DateTime.Now.AddMinutes(Convert.ToDouble(_configuration["JwtSettings:ExpirationTimeInMinutes"])),
                signingCredentials: GetSigningCredentials()
            );
            return jwt;
        }
        private async Task<List<Claim>> GetClaimsAsync(User user)
        {
            var claims = new List<Claim>
            {

                new(ClaimTypes.NameIdentifier, user.Id),
                new(ClaimTypes.Name, user.UserName!)
            };
            foreach (var role in await _userManager.GetRolesAsync(user))
            {
                claims.Add(new(ClaimTypes.Role, role));
            }
            return claims;
        }
        private SigningCredentials GetSigningCredentials()
        {
            var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecurityKey"]!);
            var secret = new SymmetricSecurityKey(key);
            return new SigningCredentials(secret, SecurityAlgorithms.HmacSha256);
        }
    }
}
