using System.IdentityModel.Tokens.Jwt;
using DBGuardAPI.Data.DTOs.AuthDTOs;
using DBGuardAPI.Data.DTOs.RequestResponseDTOs;
using DBGuardAPI.Data.DTOs.UserDTOs;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Data.StaticData;
using DBGuardAPI.Helpers;
using DBGuardAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Bcpg;
using Sieve.Models;
using static DBGuardAPI.Services.RefreshTokenService;

namespace DBGuardAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController: ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly JwtService _jwtService;
        private readonly IDbContextFactory<ApplicationDbContext> _dbContextFactory;
        private readonly EntityViewGetter _entityViewGetter;
        private readonly ILogger<UserController> _logger;
        private readonly RefreshTokenService _refreshTokenService;
        public UserController(UserManager<User> userManager, SignInManager<User> signInManager, JwtService jwtService, EntityViewGetter entityViewGetter, IDbContextFactory<ApplicationDbContext> dbContextFactory, ILogger<UserController> logger, RefreshTokenService refreshTokenService) 
        {
            _userManager = userManager;   
            _signInManager = signInManager;
            _jwtService = jwtService;
            _entityViewGetter = entityViewGetter;
            _dbContextFactory = dbContextFactory;
            _logger = logger;
            _refreshTokenService = refreshTokenService;
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
                    CreatedByUsername = user.CreatedByUser != null ? user.CreatedByUser.UserName : null,
                    IsActive = user.IsActive
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
                Roles = userRoleNames,
                IsActive = user.IsActive
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
                Roles = roles.ToList(),
                IsActive = userToEdit.IsActive
            };
        }
        [HttpGet(nameof(GetSelfInfo))]
        public async Task<ActionResult<ViewUserSelfDTO>> GetSelfInfo()
        {
            User? user = await _userManager.GetUserAsync(User);
            if(user is null)
            {
                _logger.LogError("A request for self user info was received for an invalid user");
                return NotFound();
            }
            if (!user.IsActive)
            {
                _logger.LogError("A request for self user info was received for an inactive user {UserId}", user.Id);
                return Conflict(new { Message = "User is inactive" });
            }
            var roles = await _userManager.GetRolesAsync(user);
            return new ViewUserSelfDTO
            {
                Id = user.Id,
                Username = user.UserName!,
                Roles = roles.ToList()
            };
        }
        [HttpPost(nameof(Login))]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResult>> Login(LoginRequest loginRequest)
        {
            var signInResult = await _signInManager.PasswordSignInAsync(loginRequest.Username, loginRequest.Password, isPersistent: false, lockoutOnFailure: false);
            User? user = await _userManager.FindByNameAsync(loginRequest.Username);
            if(user is null)
            {
                return new AuthResult
                {
                    Success = false,
                    Message = "No user exists"
                };
            }
            if (!user.IsActive)
            {
                return new AuthResult
                {
                    Success = false,
                    Message = "Account is not active"
                };
            }
            if (!signInResult.Succeeded)
            {
                return new AuthResult
                {
                    Success = false,
                    Message = "Invalid password"
                };
            }
            var roles = await _userManager.GetRolesAsync(user);

            var secToken = await _jwtService.GetTokenAsync(user);
            var jwt = new JwtSecurityTokenHandler().WriteToken(secToken);
            RefreshToken refreshToken = await _refreshTokenService.GenerateRefreshToken(user);
            // Store refresh token in HttpOnly cookie for security
            Response.Cookies.Append("refreshToken", refreshToken.Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = refreshToken.Expires
            });

            return new AuthResult
            {
                Success = true,
                AccessToken = jwt,
                Expiration = secToken.ValidTo,
                Username = user.UserName,
                Roles = roles.ToList()
            };

        }
        [HttpPost(nameof(LogOut))]
        [AllowAnonymous]
        public async Task<ActionResult> LogOut()
        {
            User? user = await _userManager.GetUserAsync(User);
            if(user is null)
            {
                return NotFound();
            }
            string? token = Request.Cookies["refreshToken"]; // Get refresh token in cookie
            // Revoke refresh token in database
            if (token is not null)
            {
                await _refreshTokenService.RevokeRefreshToken(token);
            }
            // Tell browser to remove refresh token
            Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
            }); 

            return Ok();
        }
        [HttpPost(nameof(RefreshToken))]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResult>> RefreshToken()
        {
            string? token = Request.Cookies["refreshToken"];
            if (token is null)
            {
                return new AuthResult
                {
                    Success = false,
                    Message = "No refresh token provided"
                };
            }
            RefreshToken? refreshToken = await _refreshTokenService.GetRefreshToken(token);
            if (refreshToken is null)
            {
                return new AuthResult
                {
                    Success = false,
                    Message = "Invalid refresh token"
                };
            }
            await _refreshTokenService.RevokeRefreshToken(token);
            User? user = await _userManager.FindByIdAsync(refreshToken.UserId);
            if (user is null)
            {
                return new AuthResult
                {
                    Success = false
                };
            }
            if (!user.IsActive)
            {
                return new AuthResult
                {
                    Success = false,
                    Message = "Account is not active"
                };
            }
            var roles = await _userManager.GetRolesAsync(user);
            RefreshToken newToken = await _refreshTokenService.GenerateRefreshToken(user);
            Response.Cookies.Append("refreshToken", newToken.Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = newToken.Expires
            });
            JwtSecurityToken accessToken = await _jwtService.GetTokenAsync(user);

            return new AuthResult
            {
                AccessToken = new JwtSecurityTokenHandler().WriteToken(accessToken),
                Expiration = accessToken.ValidTo,
                Success = true,
                Username = user.UserName,
                Roles = roles.ToList()
            };
        }
        [HttpPost(nameof(PostUser))]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<ActionResult<UserDTO>> PostUser(CreateUserDTO newUser)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            string cleanUsername = newUser.Username.Trim();
            string normalizedNewUsername = _userManager.NormalizeName(cleanUsername);

            if(normalizedNewUsername == "ADMIN")
            {
                return Conflict(new { Message = "The username \"admin\" is reserved" });
            }
            if (string.IsNullOrWhiteSpace(cleanUsername))
            {
                return BadRequest();
            }
            bool usernameTaken = await context.Users.AnyAsync(user => user.NormalizedUserName == normalizedNewUsername);
            if (usernameTaken)
            {
                return Conflict(new { Message = "Another user already has this username" });
            }
            if(newUser.Password != newUser.ConfirmPassword)
            {
                return BadRequest(new { Message = "Passwords do not match" });
            }
            if (!PasswordValidator.IsValidPassword(newUser.Password) || !PasswordValidator.IsValidPassword(newUser.ConfirmPassword))
            {
                return Conflict(new { Message = "The new password does not meet the requirements" });
            }
            User currentUser = (await _userManager.GetUserAsync(User))!;

            User user = new()
            {
                UserName = cleanUsername,
                CreatedByUserId = currentUser.Id,
                IsActive = newUser.IsActive
            };
            await _userManager.CreateAsync(user, newUser.Password);
            _logger.LogInformation("A user was created {UserId} by {CreatedById}", user.Id, currentUser.Id);
            await _userManager.AddToRolesAsync(user, newUser.Roles);
            return new UserDTO
            {
                Id = user.Id,
                Username = cleanUsername,
                CreateDate = user.CreateDate,
                LastEdited = user.LastEdited,
                CreatedByUserId = user.CreatedByUserId,
                CreatedByUsername = currentUser.UserName,
                IsActive = user.IsActive
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
            string cleanUsername = editedUser.Username.Trim();
            string normalizedUsername = _userManager.NormalizeName(cleanUsername);

            using var context = await _dbContextFactory.CreateDbContextAsync();
            if(userToEdit.NormalizedUserName != normalizedUsername)
            {
                if (normalizedUsername == "ADMIN")
                {
                    return Conflict(new { Message = "The username \"admin\" is reserved" });
                }
                // Update username
                bool usernameTaken = await context.Users.AsNoTracking().AnyAsync(user => user.Id != userToEdit.Id && user.NormalizedUserName == normalizedUsername);
                if (usernameTaken){
                    return Conflict(new { Message = "This username is already in use" });
                }
                await _userManager.SetUserNameAsync(userToEdit, cleanUsername);
                _logger.LogInformation("A username was updated for user {UserId} {Username}", userToEdit.Id, cleanUsername);
            }
            if(userToEdit.IsActive != editedUser.IsActive)
            {
                userToEdit.IsActive = editedUser.IsActive;
                await _userManager.UpdateAsync(userToEdit);
                _logger.LogInformation("A user active status was changed {UserId} {ActiveStatus}", userToEdit.Id, editedUser.IsActive);
            }

            // Sync roles
            // Remove user from roles not in new object
            var currentUserRoles = await _userManager.GetRolesAsync(userToEdit);
            var rolesToRemove = currentUserRoles.Except(editedUser.Roles).ToList();
            await _userManager.RemoveFromRolesAsync(userToEdit, rolesToRemove);
            foreach(string role in rolesToRemove)
            {
                _logger.LogInformation("Role {Role} was removed for user {UserId}", role, editedUser.Id);
            }
            // Add user to roles in new object
            var rolesToAdd = editedUser.Roles.Except(currentUserRoles).ToList();
            await _userManager.AddToRolesAsync(userToEdit, rolesToAdd);
            foreach(string role in rolesToAdd)
            {
                _logger.LogInformation("Role {Role} was added for user {UserId}", role, editedUser.Id);
            }
            // Update password if password is not the hash
            if (editedUser.Password != userToEdit.PasswordHash)
            {
                await _userManager.RemovePasswordAsync(userToEdit);
                await _userManager.AddPasswordAsync(userToEdit, editedUser.Password);
                _logger.LogInformation("A user password was updated {UserId}", userToEdit.Id);
            }
            User userDTO = await context.Users.Where(user => user.Id == userToEdit.Id).Include(user => user.CreatedByUser).AsNoTracking().FirstAsync();

            return Ok(new UserDTO
            {
                Id = userToEdit.Id,
                Username = userToEdit.UserName!.Trim(),
                CreateDate = userToEdit.CreateDate,
                LastEdited = userDTO.LastEdited,
                CreatedByUserId = userDTO.CreatedByUserId,
                CreatedByUsername = userDTO.CreatedByUser!.UserName
            });
        }
        [HttpPut(nameof(PutUsername))]
        public async Task<ActionResult<EditUsernameDTO>> PutUsername(EditUsernameDTO usernameEdit)
        {
            User? user = await _userManager.GetUserAsync(User);
            if(user is null)
            {
                _logger.LogError("A username edit was attempted on an unknown user");
                return NotFound();
            }
            string cleanUsername = usernameEdit.NewUsername.Trim();
            string normalizedUsername = _userManager.NormalizeName(cleanUsername);
            if (normalizedUsername == "ADMIN")
            {
                return Conflict(new { Message = "The username \"admin\" is reserved" });
            }
            using var context = await _dbContextFactory.CreateDbContextAsync();
            if (string.IsNullOrWhiteSpace(cleanUsername))
            {
                return Conflict(new { Message = "Username cannot be null or whitespace" });
            }
            if(normalizedUsername == user.NormalizedUserName)
            {
                return Conflict(new { Message = "Updated username is the same as current username" });
            }
            bool usernameTaken = await context.Users.AsNoTracking().AnyAsync(user => user.NormalizedUserName == normalizedUsername);
            if (usernameTaken)
            {
                return Conflict(new { Message = "Username is already in use" });
            }
            await _userManager.SetUserNameAsync(user, cleanUsername);
            _logger.LogInformation("A username was updated {UserId} {Username}", user.Id, cleanUsername);
            return Ok(new EditUsernameDTO { NewUsername = cleanUsername });
        }
        [HttpPut(nameof(PutPassword))]
        public async Task<ActionResult> PutPassword(EditPasswordDTO passwordEdit)
        {
            User? user = await _userManager.GetUserAsync(User);
            if(user is null)
            {
                _logger.LogError("A password edit was attempted on an unknown user");
                return NotFound();
            }
            if(passwordEdit.NewPassword != passwordEdit.ConfirmNewPassword)
            {
                return Conflict(new { Message = "The new passwords do not match" });
            }
            if(passwordEdit.NewPassword == passwordEdit.CurrentPassword)
            {
                return Conflict(new { Message = "The new password is the same as the old password" });
            }
            if (!PasswordValidator.IsValidPassword(passwordEdit.NewPassword) || !PasswordValidator.IsValidPassword(passwordEdit.ConfirmNewPassword))
            {
                return Conflict(new { Message = "The new password does not meet the requirements" });
            }
            var passwordChangeResult = await _userManager.ChangePasswordAsync(user, passwordEdit.CurrentPassword, passwordEdit.NewPassword);
            if (!passwordChangeResult.Succeeded)
            {
                return Conflict(new { Message = passwordChangeResult.Errors.First().Description });
            }
            _logger.LogInformation("User {UserId} changed their password", user.Id);
            await _signInManager.RefreshSignInAsync(user);
            return Ok();
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
