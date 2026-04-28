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
using Org.BouncyCastle.Bcpg;
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

        [HttpGet(nameof(GetCreateUserRefData))]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<ActionResult<CreateUserReferenceData>> GetCreateUserRefData()
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            List<string> roles = await context.Roles.Select(role => role.Name!).ToListAsync();
            return new CreateUserReferenceData
            {
                Roles = roles
            };
        }
        [Authorize(Roles = RoleNames.Admin)]
        [HttpGet(nameof(GetUserToEdit))]
        public async Task<ActionResult<CreateUserDTO>> GetUserToEdit([FromQuery] string userId)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            User? userToEdit = await context.Users.FindAsync(userId);
            if(userToEdit is null)
            {
                _logger.LogError("A get user to edit request was made for a non-existing userId {UserId}", userId);
            }
            IList<string> roles = await _userManager.GetRolesAsync(userToEdit!);
            return new CreateUserDTO
            {
                Id = userToEdit!.Id,
                Username = userToEdit.UserName!,
                Password = userToEdit.PasswordHash!,
                ConfirmPassword = userToEdit.PasswordHash!,
                Roles = roles.ToList()
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
        [HttpPost(nameof(PostUser))]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<ActionResult<UserDTO>> PostUser(CreateUserDTO newUser)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            if(await context.Users.AnyAsync(user => user.UserName == newUser.Username))
            {
                return Conflict(new { Message = "Another user already has this username" });
            }
            if(newUser.Password != newUser.ConfirmPassword)
            {
                return BadRequest(new { Message = "Passwords do not match" });
            }
            User currentUser = (await _userManager.GetUserAsync(User))!;

            User user = new()
            {
                UserName = newUser.Username,
                CreatedByUserId = currentUser.Id
            };
            await _userManager.CreateAsync(user, newUser.Password);
            _logger.LogInformation("A user was created {UserId} by {CreatedById}", user.Id, currentUser.Id);
            await _userManager.AddToRolesAsync(user, newUser.Roles);
            return new UserDTO
            {
                Id = user.Id,
                Username = user.UserName,
                CreateDate = user.CreateDate,
                LastEdited = user.LastEdited,
                CreatedByUserId = user.CreatedByUserId,
                CreatedByUsername = currentUser.UserName
            };
        }
        [HttpPut(nameof(PutUser))]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<ActionResult<UserDTO>> PutUser(CreateUserDTO editedUser)
        {
            if(editedUser.Id is null)
            {
                _logger.LogError("A user edit was requested without a user id");
                return BadRequest();
            }
            if(editedUser.Password != editedUser.ConfirmPassword)
            {
                return BadRequest(new { Message = "Passwords do not match"});
            }
            User? userToEdit = await _userManager.FindByIdAsync(editedUser.Id);
            if(userToEdit is null)
            {
                _logger.LogError("A user edit was requested with an invalid user id {UserId}", editedUser.Id);
                return NotFound();
            }
            userToEdit.UserName = editedUser.Username;
            await _userManager.UpdateAsync(userToEdit);
            // Remove user from roles not in new object
            var currentUserRoles = await _userManager.GetRolesAsync(userToEdit);
            var rolesToRemove = currentUserRoles.Where(role => !editedUser.Roles.Contains(role)).ToList();
            await _userManager.RemoveFromRolesAsync(userToEdit, rolesToRemove);
            // Add user to roles in new object
            var rolesToAdd = editedUser.Roles.Where(role => !currentUserRoles.Contains(role)).ToList();
            await _userManager.AddToRolesAsync(userToEdit, rolesToAdd);
            // Update password if password is not the hash
            if(editedUser.Password != userToEdit.PasswordHash)
            {
                await _userManager.RemovePasswordAsync(userToEdit);
                await _userManager.AddPasswordAsync(userToEdit, editedUser.Password);
            }
            using var context = await _dbContextFactory.CreateDbContextAsync();
            User userDTO = await context.Users.Where(user => user.Id == userToEdit.Id).Include(user => user.CreatedByUser).AsNoTracking().FirstAsync();

            return CreatedAtAction(nameof(GetUserDetails), new { UserId = userDTO.Id }, new UserDTO
            {
                Id = userToEdit.Id,
                Username = userToEdit.UserName,
                CreateDate = userToEdit.CreateDate,
                LastEdited = userDTO.LastEdited,
                CreatedByUserId = userDTO.CreatedByUserId,
                CreatedByUsername = userDTO.CreatedByUser!.UserName
            });
        }
        [Authorize(Roles = RoleNames.Admin)]
        [HttpDelete(nameof(DeleteUser))]
        public async Task<ActionResult> DeleteUser([FromQuery] string userId)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            User? userToDel = await context.Users.FindAsync(userId);
            if(userToDel is null)
            {
                _logger.LogError("A user deletion was attempted on a non-existing userId {UserId}", userId);
                return NotFound();
            }
            // Ensure if user to delete is admin there is at least another admin user in db
            if(await _userManager.IsInRoleAsync(userToDel, "Admin"))
            {
                string adminId = await context.Roles.Where(role => role.Name == "Admin").Select(role => role.Id).FirstAsync();
                int adminCount = await context.UserRoles.Where(ur => ur.RoleId == adminId).CountAsync();
                if(adminCount == 1)
                {
                    return Conflict(new { Message = "This is the only admin account. It cannot be deleted as you will lose access to the application. Create another admin before deleting this one." });
                }
            }
            await _userManager.DeleteAsync(userToDel);
            _logger.LogInformation("A user was deleted {UserId}", userId);
            return NoContent();
        }
    }
}
