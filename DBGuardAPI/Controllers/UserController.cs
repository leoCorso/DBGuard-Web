using System.IdentityModel.Tokens.Jwt;
using DBGuardAPI.Data.DTOs.AuthDTOs;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace DBGuardAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController: ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly JwtService _jwtService;
        public UserController(UserManager<User> userManager, SignInManager<User> signInManager, JwtService jwtService) 
        {
            _userManager = userManager;   
            _signInManager = signInManager;
            _jwtService = jwtService;
        }
        [HttpPost(nameof(Login))]
        public async Task<ActionResult<AuthResult>> Login(LoginRequest loginRequest)
        {
            var signInResult = await _signInManager.PasswordSignInAsync(loginRequest.Username, loginRequest.Password, isPersistent: false, lockoutOnFailure: false);
            User? user = await _userManager.FindByNameAsync(loginRequest.Username);
            if(user is null)
            {
                return Unauthorized(new AuthResult
                {
                    Success = false,
                    Message = "No user exists"
                });
            }
            if (signInResult.Succeeded)
            {
                var secToken = await _jwtService.GetTokenAsync(user);
                var jwt = new JwtSecurityTokenHandler().WriteToken(secToken);
                var refreshToken = await _userManager.GenerateUserTokenAsync(user, "RefreshTokenProvider", "RefreshToken");
                await _userManager.SetAuthenticationTokenAsync(user, "RefreshTokenProvider", "RefreshToken", refreshToken);

                return new AuthResult
                {
                    UserId = user.Id,
                    Success = true,
                    AccessToken = jwt,
                    RefreshToken = refreshToken
                };
            }
            else
            {
                return Unauthorized(new AuthResult
                {
                    Success = false,
                    Message = "Invalid password"
                });
            }
        }
        [Authorize]
        [HttpPost] 
        public async Task<ActionResult> LogOut()
        {
            User? user = await _userManager.GetUserAsync(User);
            if(user is null)
            {
                return BadRequest();
            }
            await _userManager.RemoveAuthenticationTokenAsync(user, "RefreshTokenProvider", "RefreshToken");
            return Ok();
        }
        [HttpPost(nameof(ProcessUserRefreshToken))]
        public async Task<ActionResult<AuthResult>> ProcessUserRefreshToken(RefreshTokenRequest request)
        {
            User? user = await _userManager.FindByIdAsync(request.UserId);
            if(user is null)
            {
                return Unauthorized();
            }
            bool isValid = await _userManager.VerifyUserTokenAsync(user, "RefreshTokenProvider", "RefreshToken", request.RefreshToken);
            if (!isValid)
            {
                return Unauthorized();
            }
            await _userManager.RemoveAuthenticationTokenAsync(user, "RefreshTokenProvider", "RefreshToken");
            var secToken = await _jwtService.GetTokenAsync(user);
            var jwt = new JwtSecurityTokenHandler().WriteToken(secToken);
            var refreshToken = await _userManager.GenerateUserTokenAsync(user, "RefreshTokenProvider", "RefreshToken");
            await _userManager.SetAuthenticationTokenAsync(user, "RefreshTokenProvider", "RefreshToken", refreshToken);
            return new AuthResult
            {
                UserId = user.Id,
                Success = true,
                RefreshToken = refreshToken,
                AccessToken = jwt
            };
        }
    }
}
