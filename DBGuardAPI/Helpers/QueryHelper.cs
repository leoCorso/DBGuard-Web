using System.Data;
using System.Data.Common;
using System.Net;
using DBGuardAPI.Data.Enums;
using Microsoft.Data.SqlClient;
using Microsoft.Data.Sqlite;
using MySql.Data.MySqlClient;
using Npgsql;

namespace DBGuardAPI.Helpers
{
    public static class QueryHelper
    {
        public static string BuildConnectionString(DatabaseEngine databaseEngine, string endpoint, string databaseName, string? username, string? password)
        {
            return databaseEngine switch
            {
                DatabaseEngine.SQLServer => $"Server={endpoint};Database={databaseName};User Id={username};Password={password};TrustServerCertificate=True",
                DatabaseEngine.SQLite => $"Data Source={endpoint}",  // SQLite uses file path
                DatabaseEngine.MySql => $"Server={endpoint};Database={databaseName};Uid={username};Pwd={password};",
                DatabaseEngine.PostgreSQL => $"Host={endpoint};Database={databaseName};Username={username};Password={password};",
                _ => throw new NotSupportedException($"Unsupported database engine: {databaseEngine}")
            };
        }
        public static DbConnection GetDatabaseConnection(DatabaseEngine databaseEngine, string connectionString)
        {
            return databaseEngine switch
            {
                DatabaseEngine.SQLServer => new SqlConnection(connectionString),
                DatabaseEngine.SQLite => new SqliteConnection(connectionString),
                DatabaseEngine.MySql => new MySqlConnection(connectionString),
                DatabaseEngine.PostgreSQL => new NpgsqlConnection(connectionString),
                _ => throw new NotSupportedException($"Database type '{databaseEngine}' is not supported")
            };
        }
        public static void ValidateDatabaseConnection(DatabaseEngine engine, string connectionString)
        {
            switch (engine)
            {
                case DatabaseEngine.SQLite:
                    ValidateSQLIteConnection(connectionString);
                    break;
                default:
                    ValidateRemoteConnection(engine, connectionString);
                    break;
            }
        }
        private static void ValidateSQLIteConnection(string connectionString)
        {
            var builder = new SqliteConnectionStringBuilder(connectionString);
            var dataSource = builder.DataSource;
            if (string.IsNullOrEmpty(dataSource))
            {
                throw new InvalidOperationException("SQLite connection string must specify a data source");
            }
            if (!File.Exists(dataSource))
            {
                throw new FileNotFoundException($"SQLite database file not found: {dataSource}");
            }
            // Try opening to verify it's a valid SQLite file, not just any file
            using var connection = new SqliteConnection(connectionString);
            connection.Open();
        }

        private static void ValidateRemoteConnection(DatabaseEngine engine, string connectionString)
        {
            using var connection = QueryHelper.GetDatabaseConnection(engine, connectionString);
            connection.Open();
        }
    }

}
