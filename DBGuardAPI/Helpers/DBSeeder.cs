using Microsoft.AspNetCore.Identity;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Data.Enums;
using DBGuardAPI.Data.StaticData;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore;

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
            var dbContextFactory = scope.ServiceProvider.GetRequiredService<IDbContextFactory<ApplicationDbContext>> ();
            try
            {

                await SeedRolesAsync(roleManager, configuration, logger);
                logger.LogInformation("Default roles initialized");
                await SeedAdminUserAsync(userManager, configuration, logger);
                logger.LogInformation("Default admin initialized");
                await DBSeeder.SeedViewsAsync(dbContextFactory, logger);
                logger.LogInformation("Initialized views");
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
        private static async Task SeedViewsAsync(IDbContextFactory<ApplicationDbContext> dbContextFactory, ILogger logger)
        {
            using var context = await dbContextFactory.CreateDbContextAsync();
            await context.Database.ExecuteSqlRawAsync(@"
                CREATE VIEW guard_view AS
                SELECT g.id, g.guard_name, g.create_date, g.last_run, 
                    g.created_by_user_id, u.user_name, g.count_column, 
                    g.trigger_operator, g.trigger_value, g.database_connection_id, d.end_point, d.database_engine, d.database_name, g.guard_state, g.is_active, g.total_errors, g.total_triggers, g.run_period_in_minutes 
                FROM guards g 
                JOIN ""AspNetUsers"" u ON g.created_by_user_id = u.id
                JOIN database_connections d ON g.database_connection_id = d.id
            ");
        }
    }
}
