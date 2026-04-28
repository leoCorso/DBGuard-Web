using System.Data;
using System.Data.Common;
using System.Diagnostics;
using System.Reflection.Metadata.Ecma335;
using Dapper;
using DBGuardAPI.Data.Enums;
using DBGuardAPI.Data.Models;
using DBGuardAPI.Data.Models.GuardNotifications;
using DBGuardAPI.Helpers;
using Microsoft.EntityFrameworkCore;

namespace DBGuardAPI.Services
{
    public class MonitorService: BackgroundService
    {
        private readonly IDbContextFactory<ApplicationDbContext> _dbContextFactory;
        private readonly CredentialProtector _credentialProtector;
        private readonly NotificationService _notificationService;
        private readonly ILogger<MonitorService> _logger;
        private readonly SemaphoreSlim _throttle = new SemaphoreSlim(5, 5);
        private readonly GuardProcessor _guardProcessor;
        public MonitorService(IDbContextFactory<ApplicationDbContext> dbContextFactory, ILogger<MonitorService> logger, CredentialProtector credentialProtector, NotificationService notificationService, GuardProcessor guardProcessor)
        {
            _dbContextFactory = dbContextFactory;
            _logger = logger;
            _credentialProtector = credentialProtector;
            _notificationService = notificationService;
            _guardProcessor = guardProcessor;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Starting monitoring service");

            while(!stoppingToken.IsCancellationRequested)
            {
                using var timer = new PeriodicTimer(TimeSpan.FromSeconds(60));

                do
                {
                    List<int> guardsToProcess = await GetGuardsToProcessAsync(stoppingToken);
                    if (guardsToProcess.Any())
                    {
                        IEnumerable<Task> tasks = guardsToProcess.Select(g => ProcessGuardWithThrottleAsync(g, stoppingToken));
                        await Task.WhenAll(tasks);
                    }
                }
                while (await timer.WaitForNextTickAsync());

            }
        }
        private async Task<List<int>> GetGuardsToProcessAsync(CancellationToken stoppingToken)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync(stoppingToken);
            List<int> guardIds = await context.Guards
                .Where(guard => guard.LastRun == null || (DateTimeOffset.UtcNow - guard.LastRun.Value).TotalMinutes >= guard.RunPeriodInMinutes)
                .Select(guard => guard.Id)
                .ToListAsync(stoppingToken);
            return guardIds;
        }
        private async Task ProcessGuardWithThrottleAsync(int guardId, CancellationToken stoppingToken) 
        {

            await _throttle.WaitAsync(stoppingToken); // Processes 5 guards concurrently
            await _guardProcessor.ProcessGuardAsync(guardId);
            _throttle.Release();
        }
    }
}
