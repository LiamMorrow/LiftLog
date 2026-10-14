using Microsoft.EntityFrameworkCore;

namespace LiftLog.Api.Db.Postgres;

/// <inheritdoc cref="PostgresUserDataContext" />
public class PostgresRateLimitContext(DbContextOptions<PostgresRateLimitContext> options)
    : RateLimitContext(options) { }
