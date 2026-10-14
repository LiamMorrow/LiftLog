using LiftLog.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LiftLog.Api.Db.Postgres;

/// <summary>
/// EF discovers migrations by the context type they were generated against, so each provider needs
/// its own context to keep its migration set separate. The shared model comes from the base; this
/// type adds only what Postgres storage requires.
/// </summary>
public class PostgresUserDataContext(DbContextOptions<PostgresUserDataContext> options)
    : UserDataContext(options)
{
    public override IQueryable<UserEventFilter> CreateUserEventFilterResultSet(
        IReadOnlyList<UserEventFilter> values
    ) =>
        // Postgres cannot infer the type of a bare parameter in a SELECT list.
        BuildUserEventFilterResultSet(values, mapping => $"::{mapping.StoreType}");

    public override string DataSource() => "Postgres";
}
