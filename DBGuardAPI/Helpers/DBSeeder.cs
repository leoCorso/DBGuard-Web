using Microsoft.AspNetCore.Identity;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Data.Enums;
using DBGuardAPI.Data.StaticData;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace DBGuardAPI.Helpers
{
    public static class DBSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider, ILogger logger)
        {
            using var scope = serviceProvider.CreateScope();
            var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            try
            {

                await SeedRolesAsync(roleManager, configuration, logger);
                logger.LogInformation("Default roles initialized");
                await SeedAdminUserAsync(userManager, configuration, logger);
                logger.LogInformation("Default admin initialized");
            }
            catch (Exception ex) 
            {
                logger.LogError(ex, "Error while seeding roles or admin {Message}", ex.Message);
            }
        }
        private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager, IConfiguration configuration, ILogger logger)
        {
            string[] roles = [RoleNames.Admin, RoleNames.User];
            foreach (string role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole
                    {
                        Name = role
                    });
                    logger.LogInformation("Added new role {RoleName}", role);
                }
            }
        }
        private static async Task SeedAdminUserAsync(UserManager<User> userManager, IConfiguration configuration, ILogger logger)
        {
            string? username = configuration["DefaultAdmin:Username"];
            if(userManager is null)
            {
                throw new KeyNotFoundException("The default admin username is missing from the config");
            }
            string? password = configuration["DefaultAdmin:Password"];
            if(password is null)
            {
                throw new KeyNotFoundException("The default admin password is missing from the config");
            }
            if (await userManager.FindByNameAsync(username!) is null) // If null create
            {
                User admin = new()
                {
                    UserName = username
                };
                var result = await userManager.CreateAsync(admin, password!);
                if (!result.Succeeded)
                {
                    throw new Exception($"Failed to seed admin user: {username}");
                }
                await userManager.AddToRolesAsync(admin, [RoleNames.Admin, RoleNames.User]);
                logger.LogInformation("Created default admin user");
            }
        }
    }
}
