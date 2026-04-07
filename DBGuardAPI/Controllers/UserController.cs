using System.IdentityModel.Tokens.Jwt;
using DBGuardAPI.Data.DTOs.AuthDTOs;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Services;
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
        public async Task<ActionResult<LoginResult>> Login(LoginRequest loginRequest)
        {
            var signInResult = await _signInManager.PasswordSignInAsync(loginRequest.Username, loginRequest.Password, isPersistent: false, lockoutOnFailure: false);
            User? user = await _userManager.FindByNameAsync(loginRequest.Username);
            if(user is null)
            {
                return Unauthorized(new LoginResult
                {
                    Success = false,
                    Message = "No user exists"
                });
            }
            if (signInResult.Succeeded)
            {
                var secToken = await _jwtService.GetTokenAsync(user);
                var jwt = new JwtSecurityTokenHandler().WriteToken(secToken);
                return new LoginResult
                {
                    Success = true,
                    Token = jwt
                };
            }
            else
            {
                return Unauthorized(new LoginResult
                {
                    Success = false,
                    Message = "Invalid password"
                });
            }
        }
    }
}
