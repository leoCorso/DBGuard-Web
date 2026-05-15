using System.Text;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Helpers;
using DBGuardAPI.Helpers.CustomFilters;
using DBGuardAPI.JsonConverters;
using DBGuardAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using Serilog;
using Serilog.Events;
using Sieve.Services;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();
var builder = WebApplication.CreateBuilder(args);

// Configure configurator from environment variables
ConfigurationSeeder.SeedDefaultConfiguration(builder, Log.Logger);

// Prevents including the Kesterl server type
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.AddServerHeader = false;
});

// Add services to the container.
builder.Host.UseSerilog((ctx, lc) =>
{
    lc.ReadFrom.Configuration(ctx.Configuration);
    lc.WriteTo.PostgreSQL(ctx.Configuration.GetConnectionString("DefaultConnection"), restrictedToMinimumLevel: LogEventLevel.Information, tableName: "server_logs", needAutoCreateTable: true);
    if (OperatingSystem.IsWindows()) // If on windows, log to event log as well
    {
        lc.WriteTo.EventLog(builder.Environment.ApplicationName, restrictedToMinimumLevel: LogEventLevel.Warning);
    }
    lc.WriteTo.Console();
});

var dataSourceBuilder = new NpgsqlDataSourceBuilder(builder.Configuration.GetConnectionString("DefaultConnection"));
dataSourceBuilder.EnableDynamicJson();
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContextFactory<ApplicationDbContext>(options =>
{
    options.UseNpgsql(dataSource);
    options.UseSnakeCaseNamingConvention();
});

builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.SignIn.RequireConfirmedAccount = false;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = false;
    //options.Lockout.MaxFailedAccessAttempts = 3;
})
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new()
    {
        RequireExpirationTime = true,
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecurityKey"]!)),
        ClockSkew = TimeSpan.Zero
    };
});

// Option for windows
//builder.Services.AddDataProtection()
//    .PersistKeysToFileSystem(new DirectoryInfo("/keys"))
//    .SetApplicationName(nameof(builder.Environment.ApplicationName));

// Option when deploying to docker
Directory.CreateDirectory("/app/data/dataprotection");
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo("/app/data/dataprotection"))
    .SetApplicationName(nameof(builder.Environment.ApplicationName))
    .SetDefaultKeyLifetime(TimeSpan.FromDays(90)); // Rotate keys every 90 days


builder.Services.AddScoped<JwtService>();
builder.Services.AddHostedService<MonitorService>();
builder.Services.AddHostedService<RefreshTokenCleaner>();
builder.Services.AddSingleton<CredentialProtector>();
builder.Services.AddTransient<GuardProcessor>();
builder.Services.AddTransient<NotificationService>();
builder.Services.AddScoped<SieveProcessor>();
builder.Services.AddScoped<ISieveCustomFilterMethods, GuardFilters>();
builder.Services.AddScoped<EntityViewGetter>();
builder.Services.AddScoped<RefreshTokenService>();

string[] origins = builder.Configuration["Cors:Allowed-Origins"]!.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)!;

builder.Services.AddCors(options =>
{
    options.AddPolicy("Dev", builder =>
    {
        builder.WithOrigins("http://localhost:5000", "http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
    options.AddPolicy("Prod", builder =>
    {
        builder.WithOrigins(origins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new CreateNotificationDTOConverter());
    options.JsonSerializerOptions.Converters.Add(new CreateNotificationProviderDTOConverter());
});
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddHttpClient();
var app = builder.Build();
await DBSeeder.ApplyMigrationsAsync(app);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseCors(policyName: "Dev");
    app.MapOpenApi();
}
else
{
    app.UseCors("Prod");
}

app.UseHttpsRedirection();

// Configure kestrel to serve index.html for public front end from wwwroot/apps/public for requests to /
app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(app.Environment.WebRootPath, "apps", "client")),
    RequestPath = ""
});
// Configure kestrel to serve html, css, javascript files for public frontend and add content security policy
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(app.Environment.WebRootPath, "apps", "client")),
    RequestPath = ""
});
app.MapFallbackToFile(Path.Combine("apps", "client", "index.html"));
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await DBSeeder.SeedAsync(app.Services, app.Logger);

app.Run();
