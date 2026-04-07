using System.Text;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Helpers;
using DBGuardAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Events;
var builder = WebApplication.CreateBuilder(args);

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
builder.Services.AddDbContextFactory<ApplicationDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
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
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecurityKey"]!))
    };
});
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo("/keys"))
    .SetApplicationName(nameof(builder.Environment.ApplicationName));
builder.Services.AddScoped<JwtService>();
builder.Services.AddHostedService<MonitorService>();
builder.Services.AddSingleton<CredentialProtector>();
builder.Services.AddTransient<NotificationService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Dev", builder =>
    {
        builder.WithOrigins("http://localhost:5000", "http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseCors("Dev");
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await DBSeeder.SeedAsync(app.Services, app.Logger);

app.Run();
