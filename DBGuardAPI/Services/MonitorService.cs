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
        public MonitorService(IDbContextFactory<ApplicationDbContext> dbContextFactory, ILogger<MonitorService> logger, CredentialProtector credentialProtector, NotificationService notificationService)
        {
            _dbContextFactory = dbContextFactory;
            _logger = logger;
            _credentialProtector = credentialProtector;
            _notificationService = notificationService;
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
            using var context = await _dbContextFactory.CreateDbContextAsync();
            Guard guard = (await context.Guards.Include(guard => guard.DatabaseConnection)
                .FirstOrDefaultAsync(guard => guard.Id == guardId))!;

            await _throttle.WaitAsync(stoppingToken); // Processes 5 guards concurrently
            try
            {
                string query = guard.TriggerQuery;
                string countColumn = guard.CountColumn;
                DatabaseEngine databaseEngine = guard.DatabaseConnection!.DatabaseEngine;
                string endpoint = guard.DatabaseConnection.EndPoint;
                string database = guard.DatabaseConnection.DatabaseName;
                string? username = guard.DatabaseConnection.Username;
                string? password = guard.DatabaseConnection?.Password is not null ? _credentialProtector.Decrypt(guard.DatabaseConnection!.Password!) : null;

                string connectionString = QueryHelper.BuildConnectionString(databaseEngine, endpoint, database, username, password);
                using IDbConnection connection = QueryHelper.GetDatabaseConnection(databaseEngine, connectionString);
                connection.Open();
                IDictionary<string, object> resultSet = connection.QuerySingle(query);
                
                if (!TriggerHelper.ColumnExistsInSet(countColumn, resultSet))
                {
                    if(guard.GuardState != GuardState.Error)
                    {
                        // Update guard state to error
                        ProcessGuardChange(guard.Id, guard.GuardState, GuardState.Error, $"Count column '{countColumn}' not found in query result");
                    }   
                }
                if(!int.TryParse(resultSet[countColumn].ToString(), out int count))
                {
                    // Update guard state to error if count column value is not an integer
                    if (guard.GuardState != GuardState.Error)
                    {
                        // Update guard state to error
                        ProcessGuardChange(guard.Id, guard.GuardState, GuardState.Error, $"Count column '{countColumn}' value is not an integer");
                    }
                }
                if(TriggerHelper.EvaluateTriggerCondition(count, guard.TriggerValue, guard.TriggerOperator))
                {
                    if (guard.GuardState != GuardState.Triggered)
                    {
                        // Update guard state to triggered
                        ProcessGuardChange(guard.Id, guard.GuardState, GuardState.Triggered, null, count);
                    }
                }
                else
                {
                    // Update guard state to clear if previously triggered
                    if (guard.GuardState != GuardState.Clear)
                    {
                        // Update guard state to error
                        ProcessGuardChange(guard.Id, guard.GuardState, GuardState.Clear, null, count);
                    }
                }
            }
            catch(DbException ex)
            {
                _logger.LogError(ex, "Failed to connect to {Endpoint}", guard.DatabaseConnection!.EndPoint);
                // Update guard state to error
                if (guard.GuardState != GuardState.Error)
                {
                    // Update guard state to error
                    ProcessGuardChange(guard.Id, guard.GuardState, GuardState.Error, $"Failed to connect endpoint {guard.DatabaseConnection.EndPoint}");
                }
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("Connection to {Endpoint} timed out", guard.DatabaseConnection!.EndPoint);
                // Update guard state to error
                if (guard.GuardState != GuardState.Error)
                {
                    // Update guard state to error
                    ProcessGuardChange(guard.Id, guard.GuardState, GuardState.Error, $"Connection to {guard.DatabaseConnection.EndPoint} timed out");
                }
            }
            finally
            {
                _throttle.Release();
                guard.LastRun = DateTime.UtcNow;
                await context.SaveChangesAsync();
            }
        }
        private async Task ProcessGuardChange(int guardId, GuardState previousState, GuardState newState, string? message = null, int? actualCount = null)
        {
            using var context = await _dbContextFactory.CreateDbContextAsync();
            Guard guard = await  context.Guards
                .Where(g => g.Id == guardId)
                .Include(g => g.DatabaseConnection)
                .FirstAsync();

            guard.GuardState = newState;

            GuardChangeTransaction changeTransaction = new() // Create change transaction for guard state change
            {
                GuardId = guard.Id,
                GuardState = newState,
                PreviousGuardState = previousState,
                GuardQuery = guard.TriggerQuery,
                GuardOperator = guard.TriggerOperator,
                GuardValue = guard.TriggerValue,
                ResultValue = actualCount,
                DatabaseConnectionId = guard.DatabaseConnectionId,
                DatabaseConnectionEndPoint = guard.DatabaseConnection!.EndPoint,
                DatabaseConnectionEngine = guard.DatabaseConnection.DatabaseEngine,
                DatabaseConnectionUsername = guard.DatabaseConnection.Username!
            };
            await context.GuardChangeTransactions.AddAsync(changeTransaction);
            switch(newState)
            {
                case GuardState.Triggered:
                    guard.TotalTriggers += 1;
                    break;
                case GuardState.Error:
                    guard.TotalErrors += 1;
                    break;
            }
            await context.SaveChangesAsync();

            // If change type send notification is enabled send notification
            bool sendNotification = newState switch
            {
                GuardState.Triggered => guard.NotifyOnTrigger,
                GuardState.Clear => guard.NotifyOnClear,
                GuardState.Error => guard.NotifyOnError,
                _ => false
            };
            if (sendNotification)
            {
                List<GuardNotification> notifications = await context.GuardNotifications.Where(n => n.GuardId == guardId).ToListAsync();
                await _notificationService.ProcesNotifications(notifications, message); 
            }
        }
    }
}
