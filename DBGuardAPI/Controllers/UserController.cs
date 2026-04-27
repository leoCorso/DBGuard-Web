using System.IdentityModel.Tokens.Jwt;
using DBGuardAPI.Data.DTOs.AuthDTOs;
using DBGuardAPI.Data.DTOs.RequestResponseDTOs;
using DBGuardAPI.Data.DTOs.UserDTOs;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Data.StaticData;
using DBGuardAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;

namespace DBGuardAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController: ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly JwtService _jwtService;
        private readonly IDbContextFactory<ApplicationDbContext> _dbContextFactory;
        private readonly EntityViewGetter _entityViewGetter;
        private readonly ILogger<UserController> _logger;
        public UserController(UserManager<User> userManager, SignInManager<User> signInManager, JwtService jwtService, EntityViewGetter entityViewGetter, IDbContextFactory<ApplicationDbContext> dbContextFactory, ILogger<UserController> logger) 
        {
            _userManager = userManager;   
            _signInManager = signInManager;
            _jwtService = jwtService;
            _entityViewGetter = entityViewGetter;
            _dbContextFactory = dbContextFactory;
            _logger = logger;
        }
        [HttpGet(nameof(GetUsers))]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<ActionResult<PagedResponseDTO<UserDTO>>> GetUsers([FromQuery] SieveModel sieveModel)
        {
            if(sieveModel.Page is null || sieveModel.PageSize is null)
            {
                return BadRequest();
            }
            using var context = await _dbContextFactory.CreateDbContextAsync();
            IQueryable<UserDTO> query = context.Users.AsNoTracking()
                .Include(user => user.CreatedByUser)
                .Select(user => new UserDTO
                {
                    Id = user.Id,
                    Username = user.UserName!,
                    CreateDate = user.CreateDate,
                    LastEdited = user.LastEdited,
                    CreatedByUserId = user.CreatedByUserId,
                    CreatedByUsername = user.CreatedByUser != null ? user.CreatedByUser.UserName : null
                }).AsQueryable();
            return await _entityViewGetter.GetPagedResponseAsync<UserDTO>(sieveModel, query);
                
        }
        [HttpGet(nameof(GetUserDetails))]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<ActionResult<UserDetailDTO>> GetUserDetails([FromQuery] string userId)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            User? user = await context.Users
                .Where(u => u.Id == userId)
                .Include(u => u.CreatedByUser)

                .FirstOrDefaultAsync();
            if(user is null)
            {
                _logger.LogWarning("A user details get request was made for an invalid user id {UserId}", userId);
                return NotFound();
            }
            List<string> userRolesIds = await context.UserRoles
                .Where(ur => ur.UserId == userId)
                .Select(ur => ur.RoleId)
                .ToListAsync();
            List<string> userRoleNames = [];
            if (userRolesIds.Any())
            {
                userRoleNames = await context.Roles
                    .Where(role => userRolesIds.Contains(role.Id))
                    .Select(role => role.Name!)
                    .ToListAsync();
            }
            return new UserDetailDTO
            {
                Id = user.Id,
                Username = user.UserName!,
                CreateDate = user.CreateDate,
                LastEdited = user.LastEdited,
                CreatedByUserId = user.CreatedByUserId,
                CreatedByUsername = user.CreatedByUser != null ? user.CreatedByUser.UserName : null,
                Roles = userRoleNames
            };
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
