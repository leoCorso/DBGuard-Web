using DBGuardAPI.Data.Enums;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Data.Models.NotificationProviders;
using DBGuardAPI.Data.StaticData;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace DBGuardAPI.Helpers
{
    public static class DBSeeder
    {
        public static async Task ApplyMigrationsAsync(WebApplication app)
        {
            try
            {
                using var scope = app.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>(); // your DbContext
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

                Log.Information("Applying database migrations...");
                await db.Database.MigrateAsync();
                Log.Information("Migrations applied successfully.");
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "Failed to apply migrations.");
                throw;
            }
        }
        public static async Task SeedAsync(IServiceProvider serviceProvider, Microsoft.Extensions.Logging.ILogger logger)
        {
            using var scope = serviceProvider.CreateScope();
            var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var dbContextFactory = scope.ServiceProvider.GetRequiredService<IDbContextFactory<ApplicationDbContext>> ();
            try
            {

                await SeedRolesAsync(roleManager, configuration, logger);
                logger.LogInformation("Roles initialized");
                await SeedAdminUserAsync(userManager, configuration, logger);
                await DBSeeder.SeedViewsAsync(dbContextFactory, logger);
                logger.LogInformation("Initialized views");
                await DBSeeder.SeedDefaultNotificationProviders(dbContextFactory, logger);
                logger.LogInformation("Initialized default notification providers");
            }
            catch (Exception ex) 
            {
                logger.LogError(ex, "Error while seeding roles or admin {Message}", ex.Message);
            }
        }
        private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager, IConfiguration configuration, Microsoft.Extensions.Logging.ILogger logger)
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
        private static async Task SeedAdminUserAsync(UserManager<User> userManager, IConfiguration configuration, Microsoft.Extensions.Logging.ILogger logger)
        {
            string? appDataPath = configuration["AppDataPath"];
            if (appDataPath is null)
            {
                throw new KeyNotFoundException("The app data path is missing from config");
            }
            string seedFlagFile = Path.Combine(appDataPath, ".admin-seeded");
            //string seedFlagFile = "./.admin-seeded"; // Use in dev

            if (File.Exists(seedFlagFile)) // If file exists we already created admin once
            {
                logger.LogInformation("Admin already seeded");
                return;
            }

            string? username = configuration["DefaultAdmin:Username"];
            if(string.IsNullOrWhiteSpace(username))
            {
                throw new KeyNotFoundException("The default admin username is missing from the config");
            }
            string? password = configuration["DefaultAdmin:Password"];
            if(string.IsNullOrWhiteSpace(password))
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
                File.WriteAllText(seedFlagFile, DateTimeOffset.UtcNow.ToString("O"));
                logger.LogInformation("Created default admin user");
            }
        }
        private static async Task SeedViewsAsync(IDbContextFactory<ApplicationDbContext> dbContextFactory, Microsoft.Extensions.Logging.ILogger logger)
        {
            using var context = await dbContextFactory.CreateDbContextAsync();
            await context.Database.ExecuteSqlRawAsync(@"
                CREATE OR REPLACE VIEW guard_view AS
                SELECT g.id, g.guard_name, g.create_date, g.last_run, 
                    g.created_by_user_id, u.user_name, g.trigger_column, 
                    g.trigger_operator, g.trigger_value, g.database_connection_id, d.end_point, d.database_engine, d.database_name, g.guard_state, g.is_active, g.total_errors, g.total_triggers, g.run_period_in_minutes 
                FROM guards g 
                JOIN ""AspNetUsers"" u ON g.created_by_user_id = u.id
                JOIN database_connections d ON g.database_connection_id = d.id
            ");
        }
        private static async Task SeedDefaultNotificationProviders(IDbContextFactory<ApplicationDbContext> dbContextFactory, Microsoft.Extensions.Logging.ILogger logger)
        {
            using var context = await dbContextFactory.CreateDbContextAsync();
            if(await context.NotificationProviders.AnyAsync(provider => provider.ProviderType == NotificationType.HTTP))
            {
                return;
            }
            HTTPProvider newProvider = new()
            {
                ProviderType = NotificationType.HTTP,
            };
            await context.NotificationProviders.AddAsync(newProvider);
            await context.SaveChangesAsync();
        }
    }
}
