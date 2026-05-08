using DBGuardAPI.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace DBGuardAPI.Services
{
    public class RefreshTokenCleaner: BackgroundService // Removes expired and revoked refresh tokens
    {
        private readonly IDbContextFactory<ApplicationDbContext> _dbContextFactory;
        private readonly ILogger<RefreshTokenCleaner> _logger;
        public RefreshTokenCleaner(IDbContextFactory<ApplicationDbContext> dbContextFactory, ILogger<RefreshTokenCleaner> logger)
        {
            _dbContextFactory = dbContextFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using var timer = new PeriodicTimer(TimeSpan.FromHours(6));
            do
            {
                await CleanUp(stoppingToken);
            }
            while (await timer.WaitForNextTickAsync(stoppingToken));
        }
        private async Task CleanUp(CancellationToken stoppingToken)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            int deletedCount = await context.RefreshTokens
                .Where(token => token.Expires < DateTime.UtcNow || token.IsRevoked)
                .ExecuteDeleteAsync(stoppingToken);
            _logger.LogInformation("Deleted {Count} refresh tokens", deletedCount);
        }
    }
}
