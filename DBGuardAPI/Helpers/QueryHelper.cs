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
                DatabaseEngine.SQLServer => $"Server={endpoint};Database={databaseName};User Id={username};Password={password};",
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
    }

}
