using System.Security.Cryptography;
using Serilog;

namespace DBGuardAPI.Helpers
{
    public static class ConfigurationSeeder // Seeds some default env values and inject values into configuration for use in app
    {
        // Default app data path key 
        private static readonly string AppDataPathKey = "AppDataPath";
        // Default app data path
        private static readonly string DefaultAppDataPath = "/app/data";
        // Db keys
        private static readonly string DBHostKey = "DATABASE_HOST";
        private static readonly string DBHPortKey = "DATABASE_PORT";
        private static readonly string DBNameKey = "DATABASE_NAME";
        private static readonly string DBUserIdKey = "DATABASE_USER";
        private static readonly string DBPasswordKey = "DATABASE_PASSWORD";

        // Default db values
        private static readonly string DefaultDBHost = "postgres"; // Use for docker prod
        private static readonly string DefaultDBPort = "5432";
        private static readonly string DefaultDBName = "dbguard-web";
        private static readonly string DefaultDBUserId = "dbguard-web";
        private static readonly string DefaultDBPassword = "abc123##";

        // Default jwt keys
        private static readonly string JWTSecurityKeyKey = "JWT_KEY";
        private static readonly string JwtIssuerKey = "JWT_ISSUER";
        private static readonly string JwtAudienceKey = "JWT_AUDIENCE";
        private static readonly string AccessTokenExpirationKey = "JWT_ACCESS_TOKEN_EXPIRATION";
        private static readonly string  RefreshTokenExpirationKey = "JWT_REFRESH_TOKEN_EXPIRATION";

        private static readonly string DefaultTokenExpiration = "15";
        private static readonly string DefaultRefreshTokenExpiration = "1440";

        // Admin user keys
        private static readonly string UsernameKey = "APP_USERNAME";
        private static readonly string PasswordKey = "PASSWORD";

        // Admin user values
        private static readonly string Username = "admin";
        private static readonly string Password = "Admin123!";

        // Cors key
        private static readonly string DefaultCorsKey = "ALLOWED_ORIGINS";

        // Host and port key
        private static readonly string HostKey = "APP_HOST";
        private static readonly string PortKey = "APP_PORT";
        // Host value
        private static readonly string DefaultHostValue = "localhost";
        private static readonly string DefaultPortValue = "5000";

        public static void SeedDefaultConfiguration(WebApplicationBuilder builder, Serilog.ILogger logger)
        {
            SeedAppDataPath(builder, logger);
            if (builder.Environment.IsProduction()) // We only need to seed CORS in prod since dev will use dev policy
            {
                SeedCorsDefault(builder, logger);
            }
            SeedDatabaseConnection(builder, logger);
            SeedJwtInfo(builder, logger);
            SeedJwtKey(builder, logger);
            SeedDefaultUserCredentials(builder, logger);
        }
        private static void SeedAppDataPath(WebApplicationBuilder builder, Serilog.ILogger logger)
        {
            string? appDataPath = builder.Configuration[AppDataPathKey];
            if (appDataPath is not null) // If app data path is provided in config (During dev) we skip getting from environment variables
            {
                logger.Information("App data path obtained from appsettings");
                return;
            }
            builder.Configuration["AppDataPath"] = DefaultAppDataPath;
            logger.Information("App data path obtained from app default");
        }
        private static void SeedDatabaseConnection(WebApplicationBuilder builder, Serilog.ILogger logger)
        {
            string? existing = builder.Configuration.GetConnectionString(("DefaultConnection"));
            if (!string.IsNullOrWhiteSpace(existing))
            {
                logger.Information("Connection string obtained from appsettings");
                return;
            }
            // Get overwritten database config keys or use defaults
            string host;
            string? envHost = Environment.GetEnvironmentVariable(DBHostKey);
            if (!string.IsNullOrWhiteSpace(envHost))
            {
                host = envHost;
                logger.Information("Database host obtained from environment variable");
            }
            else
            {
                host = DefaultDBHost;
                logger.Information("Database host obtained from app default");
            }
            string port;
            string? envPort = Environment.GetEnvironmentVariable(DBHPortKey);
            if (!string.IsNullOrWhiteSpace(envPort))
            {
                port = envPort;
                logger.Information("Database port obtained from envrionment variable");
            }
            else
            {
                port = DefaultDBPort;
                logger.Information("Database port obtained from app defaults");
            }

            string database;
            string? envDatabase = Environment.GetEnvironmentVariable(DBNameKey);
            if (!string.IsNullOrWhiteSpace(envDatabase))
            {
                database = envDatabase;
                logger.Information("Database name obtained from environment variable");
            }
            else
            {
                database = DefaultDBName;
                logger.Information("Database name obtained from app defaults");
            }

            string username;
            string? envUsername = Environment.GetEnvironmentVariable(DBUserIdKey);
            if (!string.IsNullOrWhiteSpace(envUsername))
            {
                username = envUsername;
                logger.Information("Database userid obtained from environment variable");
            }
            else
            {
                username = DefaultDBUserId;
                logger.Information("Database userid obtained from app defaults");
            }

            string password;
            string? envPassword = Environment.GetEnvironmentVariable(DBPasswordKey);
            if (!string.IsNullOrWhiteSpace(envPassword))
            {
                password = envPassword;
                logger.Information("Database password obtained from environment variable");
            }
            else
            {
                password = DefaultDBPassword;
                logger.Information("Database password obtained from app defaults");
            }

            // Create connections string
            string connectionString = $"Host={host};Port={port};Database={database};User Id={username};Password={password}";
            // Append to configuration object for use throughout application
            builder.Configuration["ConnectionStrings:DefaultConnection"] = connectionString;
            logger.Information("Database connection string assembled from environment/defaults");
        }
        private static void SeedJwtKey(WebApplicationBuilder builder, Serilog.ILogger logger)
        {
            string? jwtKey = builder.Configuration["JwtSettings:SecurityKey"];
            // If securt key provided in appsettings
            if (!string.IsNullOrWhiteSpace(jwtKey)){
                logger.Information("Jwt security key obtained from appsettings");
                return;
            }
            string keyFilePath = Path.Combine(DefaultAppDataPath, "jwt_secret.key");
            string? envKey = Environment.GetEnvironmentVariable(JWTSecurityKeyKey);
            // If security key added in environment variable use it
            if (!string.IsNullOrWhiteSpace(envKey))
            {
                builder.Configuration["JwtSettings:SecurityKey"] = envKey;
                logger.Information("JWT Security key obtained from environment variable");
                return;
            }
            // If security key exists in file from previous boot use it
            if (File.Exists(keyFilePath))
            {
                string existingKey = File.ReadAllText(keyFilePath).Trim();
                if (!string.IsNullOrWhiteSpace(existingKey))
                {
                    logger.Information("JWT Security key obtained from persisted file");
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
            string? configIssuer = builder.Configuration["JwtSettings:Issuer"];
            string issuer;
            // Issuer provided in appsettings (dev)
            if (!string.IsNullOrWhiteSpace(configIssuer))
            {
                issuer = configIssuer;
                logger.Information("Obtained issuer from appsettings");
            }
            else
            {
                // Else get from environment variables or default
                string? environmentIssuer = Environment.GetEnvironmentVariable(JwtIssuerKey);
                if (!string.IsNullOrWhiteSpace(environmentIssuer))
                {
                    issuer = environmentIssuer;
                    logger.Information("Obtained issuer from environment variable");
                }
                else
                {
                    issuer = "http://" + GetHost() + ":" + GetPort();
                    logger.Information("Obtained issuer from app default");
                }
            }

            string audience;
            string? configAudience = builder.Configuration["JwtSettings:Audience"];
            if (!string.IsNullOrWhiteSpace(configAudience))
            {
                audience = configAudience;
                logger.Information("Obtained audience from appsettings");
            }
            else
            {
                string? envAudience = Environment.GetEnvironmentVariable(JwtAudienceKey);
                if (!string.IsNullOrWhiteSpace(envAudience))
                {
                    audience = envAudience;
                    logger.Information("Obtained audience from environment variable");
                }
                else
                {
                    audience = "http://" + GetHost() + ":" + GetPort();
                    logger.Information("Obtained audience from app defaults");
                }
            }

            string? configTokenExp = builder.Configuration["JwtSettings:AccessTokenExpirationInMinutes"];
            string tokenExpiration;
            if (!string.IsNullOrWhiteSpace(configTokenExp))
            {
                tokenExpiration = configTokenExp;
                logger.Information("Obtained token expiration from appsettings");
            }
            else
            {
                string? envTokenExp = Environment.GetEnvironmentVariable(AccessTokenExpirationKey);
                if (!string.IsNullOrWhiteSpace(envTokenExp))
                {
                    tokenExpiration = envTokenExp;
                    logger.Information("Obtained token expiration from environment variable");
                }
                else
                {
                    tokenExpiration = DefaultTokenExpiration;
                    logger.Information("Obtained token expiration from app default");
                }
            }
            string? configRefreshExp = builder.Configuration["JwtSettings:RefreshTokenExpirationInMinutes"];
            string refreshExpiration;
            if (!string.IsNullOrWhiteSpace(configRefreshExp))
            {
                refreshExpiration = configRefreshExp;
                logger.Information("Obtained refresh token expiration from appsettings");
            }
            else
            {
                string? envRefreshExp = Environment.GetEnvironmentVariable(RefreshTokenExpirationKey);
                if (!string.IsNullOrWhiteSpace(envRefreshExp))
                {
                    refreshExpiration = envRefreshExp;
                    logger.Information("Obtained refresh token expiration from environment variable");
                }
                else
                {
                    refreshExpiration = DefaultRefreshTokenExpiration;
                    logger.Information("Obtained refresh token expiration from app defaults");
                }
            }
            builder.Configuration["JwtSettings:Issuer"] = issuer;
            builder.Configuration["JwtSettings:Audience"] = audience;
            builder.Configuration["JwtSettings:AccessTokenExpirationInMinutes"] = tokenExpiration;
            builder.Configuration["JwtSettings:RefreshTokenExpirationInMinutes"] = refreshExpiration;
            logger.Information("Jwt information assembled");
        }
        private static string GenerateSecureKey()
        {
            byte[] bytes = new byte[64];
            RandomNumberGenerator.Fill(bytes);
            return Convert.ToBase64String(bytes);
        }
        private static void SeedDefaultUserCredentials(WebApplicationBuilder builder, Serilog.ILogger logger)
        {
            string username;
            string? configUsername = builder.Configuration["DefaultAdmin:Username"];
            if (!string.IsNullOrWhiteSpace(configUsername))
            {
                username = configUsername;
                logger.Information("Obtained default username from appsettings");
            }
            else
            {
                string? envUsername = Environment.GetEnvironmentVariable(UsernameKey);
                if (!string.IsNullOrWhiteSpace(envUsername))
                {
                    username = envUsername;
                    logger.Information("Obtained default username from environment variable");
                }
                else
                {
                    username = Username;
                    logger.Information("Obtained username from app defaults");
                }
            }
            string password;
            string? configPassword = builder.Configuration["DefaultAdmin:Password"];
            if (!string.IsNullOrWhiteSpace(configPassword))
            {
                password = configPassword;
                logger.Information("Obtained default password from appsettings");
            }
            else
            {
                string? envPassword = Environment.GetEnvironmentVariable(PasswordKey);
                if (!string.IsNullOrWhiteSpace(envPassword))
                {
                    password = envPassword;
                    logger.Information("Obtained default password from environment variable");
                }
                else
                {
                    password = Password;
                    logger.Information("Obtained default password from app default");
                }
            }
            builder.Configuration["DefaultAdmin:Username"] = username;
            builder.Configuration["DefaultAdmin:Password"] = password;
        }
        private static void SeedCorsDefault(WebApplicationBuilder builder, Serilog.ILogger logger)
        {
            string defaultCors = "http://" + GetHost() + ":" + GetPort();
            builder.Configuration["Cors:Allowed-Origins"] = defaultCors + "," + Environment.GetEnvironmentVariable(DefaultCorsKey);
        }
        private static string GetHost()
        {
            return Environment.GetEnvironmentVariable(HostKey) ?? DefaultHostValue;
        }
        private static string GetPort()
        {
            return Environment.GetEnvironmentVariable(PortKey) ?? DefaultPortValue;
        }
    }
}
