using LiftLog.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LiftLog.Api.Db.Sqlite;

/// <summary>
/// EF discovers migrations by the context type they were generated against, so each provider needs
/// its own context to keep its migration set separate. The shared model comes from the base; this
/// type adds only what SQLite storage requires.
/// </summary>
public class SqliteUserDataContext(DbContextOptions<SqliteUserDataContext> options)
    : UserDataContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.StoreDateTimeOffsetsAsUtcTicks();
    }

    public override IQueryable<UserEventFilter> CreateUserEventFilterResultSet(
        IReadOnlyList<UserEventFilter> values
    ) =>
        // SQLite takes the parameter's own type, so no casts are needed.
        BuildUserEventFilterResultSet(values, _ => string.Empty);

    public override string DataSource() => "Sqlite";
}
