using System.Data.Common;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace LiftLog.Api.Db;

/// <summary>
/// SQLite allows a single writer at a time. WAL lets the hourly cleanup service write while requests
/// read, and busy_timeout makes concurrent writers wait rather than fail with SQLITE_BUSY.
/// </summary>
public class SqlitePragmaInterceptor : DbConnectionInterceptor
{
    private const int SqliteReadOnly = 8;

    public override void ConnectionOpened(DbConnection connection, ConnectionEndEventData eventData)
    {
        ApplyPragmas(connection);
        base.ConnectionOpened(connection, eventData);
    }

    public override async Task ConnectionOpenedAsync(
        DbConnection connection,
        ConnectionEndEventData eventData,
        CancellationToken cancellationToken = default
    )
    {
        ApplyPragmas(connection);
        await base.ConnectionOpenedAsync(connection, eventData, cancellationToken);
    }

    private static void ApplyPragmas(DbConnection connection)
    {
        // Scoped to this connection, so it works even when the connection cannot write.
        Execute(connection, "PRAGMA busy_timeout = 5000;");

        try
        {
            Execute(connection, "PRAGMA journal_mode = WAL;");
        }
        catch (SqliteException e) when (e.SqliteErrorCode == SqliteReadOnly)
        {
            // EF opens the database read-only to check whether it exists before migrating.
        }
    }

    private static void Execute(DbConnection connection, string sql)
    {
        using var command = connection.CreateCommand();
        command.CommandText = sql;
        command.ExecuteNonQuery();
    }
}
