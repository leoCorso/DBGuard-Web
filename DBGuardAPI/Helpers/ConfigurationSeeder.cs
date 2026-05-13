using System.Security.Cryptography;
using Serilog;

namespace DBGuardAPI.Helpers
{
    public static class ConfigurationSeeder // Seeds some default env values and inject values into configuration for use in app
    {
        // Db keys
        private static readonly string DBHostKey = "database_host";
        private static readonly string DBHPortKey = "database_port";
        private static readonly string DBNameKey = "database_name";
        private static readonly string DBUserIdKey = "database_username";
        private static readonly string DBPasswordKey = "database_password";

        // Default db values
        private static readonly string DefaultDBHost = "postgres"; // Use for docker prod
        //private static readonly string DefaultDBHost = "10.55.47.166"; // Use when testing on windows

        private static readonly string DefaultDBPort = "5432";
        private static readonly string DefaultDBName = "dbguard-web";
        private static readonly string DefaultDBUserId = "dbguard-web";
        private static readonly string DefaultDBPassword = "abc123##";

        // Default jwt keys
        private static readonly string JWTSecurityKeyKey = "jwt_key";
        private static readonly string JwtIssuerKey = "jwt_issuer";
        private static readonly string JwtAudienceKey = "jwt_audience";
        private static readonly string AccessTokenExpirationKey = "jwt_access_token_expiration";
        private static readonly string  RefreshTokenExpirationKey = "jwt_refresh_token_expiration";

        // Default jwt values
        private static readonly string DefaultKeyFilePath = "/app/data/jwt_secret.key"; // Use for docker prod
        //private static readonly string DefaultKeyFilePath = "./jwt_secret.key"; // Use in dev windows

        private static readonly string DefaultJwtIssuer = "http://localhost:5000";
        private static readonly string DefaultJwtAudience = "http://localhost:5000";
        private static readonly string DefaultTokenExpiration = "15";
        private static readonly string DefaultRefreshTokenExpiration = "1440";

        // Admin user keys
        private static readonly string UsernameKey = "AppUsername";
        private static readonly string PasswordKey = "Password";

        // Admin user values
        private static readonly string Username = "admin";
        private static readonly string Password = "Admin123!";

        // Cors key
        private static readonly string DefaultCorsKey = "allowed-origins";
        // Cors default value
        private static readonly string DefaultCors = "http://localhost:5000";

        public static void SeedDefaultConfiguration(WebApplicationBuilder builder, Serilog.ILogger logger)
        {
            SeedCorsDefault(builder, logger);
            SeedDatabaseConnection(builder, logger);
            SeedJwtInfo(builder, logger);
            SeedJwtKey(builder, logger);
            SeedDefaultUserCredentials(builder, logger);
        }
        private static void SeedDatabaseConnection(WebApplicationBuilder builder, Serilog.ILogger logger)
        {
            // Get overwritten database config keys or use defaults
            string host = Environment.GetEnvironmentVariable(DBHostKey) ?? DefaultDBHost;
            string port = Environment.GetEnvironmentVariable(DBHPortKey) ?? DefaultDBPort;
            string database = Environment.GetEnvironmentVariable(DBNameKey) ?? DefaultDBName;
            string username = Environment.GetEnvironmentVariable(DBUserIdKey) ?? DefaultDBUserId;
            string password = Environment.GetEnvironmentVariable(DBPasswordKey) ?? DefaultDBPassword;

            // Create connections string
            string connectionString = $"Host={host};Port={port};Database={database};User Id={username};Password={password}";
            // Append to configuration object for use throughout application
            builder.Configuration["ConnectionStrings:DefaultConnection"] = connectionString;
            logger.Information("Database connection string assembled from environment/defaults");
        }
        private static void SeedJwtKey(WebApplicationBuilder builder, Serilog.ILogger logger)
        {
            string keyFilePath = DefaultKeyFilePath;
            string? envKey = Environment.GetEnvironmentVariable(JWTSecurityKeyKey);
            // If security key added in environment variable use it
            if (!string.IsNullOrWhiteSpace(envKey))
            {
                logger.Information("JWT Security key loaded from environment variable");
                builder.Configuration["JwtSettings:SecurityKey"] = envKey;
                return;
            }
            // If security key exists in file use it
            if (File.Exists(keyFilePath))
            {
                string existingKey = File.ReadAllText(keyFilePath).Trim();
                if (!string.IsNullOrWhiteSpace(existingKey))
                {
                    logger.Information("JWT Security key loaded from persisted file");
                    builder.Configuration["JwtSettings:SecurityKey"] = existingKey;
                    return;
                }
            }
            // Else generate and store key for future use
            string newKey = GenerateSecureKey();
            Directory.CreateDirectory(Path.GetDirectoryName(keyFilePath)!);
            File.WriteAllText(keyFilePath, newKey);
            logger.Warning("JWT Security key auto-generated and saved to {Path}", keyFilePath);
            builder.Configuration["JwtSettings:SecurityKey"] = newKey;
        }
        private static void SeedJwtInfo(WebApplicationBuilder builder, Serilog.ILogger logger)
        {
            string issuer = Environment.GetEnvironmentVariable(JwtIssuerKey) ?? DefaultJwtIssuer;
            string audience = Environment.GetEnvironmentVariable(JwtAudienceKey) ?? DefaultJwtAudience;
            string tokenExpiration = Environment.GetEnvironmentVariable(AccessTokenExpirationKey) ?? DefaultTokenExpiration;
            string refreshExpiration = Environment.GetEnvironmentVariable (RefreshTokenExpirationKey) ?? DefaultRefreshTokenExpiration;
            builder.Configuration["JwtSettings:Issuer"] = issuer;
            builder.Configuration["JwtSettings:Audience"] = audience;
            builder.Configuration["JwtSettings:AccessTokenExpirationInMinutes"] = tokenExpiration;
            builder.Configuration["JwtSettings:RefreshTokenExpirationInMinutes"] = refreshExpiration;
            logger.Information("Jwt information assembled from environment");
        }
        private static string GenerateSecureKey()
        {
            byte[] bytes = new byte[64];
            RandomNumberGenerator.Fill(bytes);
            return Convert.ToBase64String(bytes);
        }
        private static void SeedDefaultUserCredentials(WebApplicationBuilder builder, Serilog.ILogger logger)
        {
            string username = Environment.GetEnvironmentVariable(UsernameKey) ?? Username;
            string password = Environment.GetEnvironmentVariable(PasswordKey) ?? Password;
            builder.Configuration["DefaultAdmin:Username"] = username;
            builder.Configuration["DefaultAdmin:Password"] = password;
        }
        private static void SeedCorsDefault(WebApplicationBuilder builder, Serilog.ILogger logger)
        {
            string allowedOrigins = Environment.GetEnvironmentVariable(DefaultCorsKey) ?? DefaultCors;
            builder.Configuration["Cors:Allowed-Origins"] = allowedOrigins;
        }
    }
}
