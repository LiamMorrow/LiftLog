using System.Text;
using LiftLog.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage;

namespace LiftLog.Api.Db;

public abstract class UserDataContext : DbContext
{
    protected UserDataContext(DbContextOptions options)
        : base(options) { }

    public abstract string DataSource();

    public DbSet<User> Users { get; set; } = null!;

    public DbSet<UserEvent> UserEvents { get; set; } = null!;

    public DbSet<UserFollowSecret> UserFollowSecrets { get; set; } = null!;

    public DbSet<UserInboxItem> UserInboxItems { get; set; } = null!;

    public DbSet<SharedItem> SharedItems { get; set; } = null!;

    /// <summary>
    /// Used to register the user event filter tuple type as a DbSet for use in FromSqlRaw.
    /// </summary>
    public DbSet<UserEventFilter> UserEventFilterStubDbSet { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .Entity<UserEventFilter>()
            .HasNoKey()
            .ToTable("tmp_stub_table", t => t.ExcludeFromMigrations());

        modelBuilder
            .Entity<User>()
            .HasMany<UserEvent>()
            .WithOne(x => x.User)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<User>()
            .HasMany<UserFollowSecret>()
            .WithOne(x => x.User)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<User>()
            .HasMany<UserInboxItem>()
            .WithOne(x => x.User)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<User>()
            .HasMany<SharedItem>()
            .WithOne(x => x.User)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserEvent>().HasIndex(x => x.Expiry);

        modelBuilder.Entity<UserEvent>().HasKey(x => new { x.UserId, x.Id });
    }

    /// <summary>
    /// Fabricates a server side result set of (user_id, since) pairs so a caller can join a
    /// variable length client side list against user_events in a single round trip.
    /// </summary>
    public abstract IQueryable<UserEventFilter> CreateUserEventFilterResultSet(
        IReadOnlyList<UserEventFilter> values
    );

    /// <param name="castSuffix">
    /// Rendered after each parameter in the SELECT list. Postgres cannot infer the type of a bare
    /// parameter there and needs an explicit cast; SQLite needs none.
    /// </param>
    protected IQueryable<UserEventFilter> BuildUserEventFilterResultSet(
        IReadOnlyList<UserEventFilter> values,
        Func<RelationalTypeMapping, string> castSuffix
    )
    {
        var columnNames = (UserId: "user_id", Since: "since");
        var entityType = Model.FindEntityType(typeof(UserEventFilter))!;

        // Bind each value the way EF would write the corresponding column, so the join still
        // matches under provider specific storage (Postgres uuid/timestamptz vs SQLite's converters).
        var userIdMapping = entityType
            .FindProperty(nameof(UserEventFilter.UserId))!
            .GetRelationalTypeMapping();
        var sinceMapping = entityType
            .FindProperty(nameof(UserEventFilter.Since))!
            .GetRelationalTypeMapping();
        var userIdCast = castSuffix(userIdMapping);
        var sinceCast = castSuffix(sinceMapping);

        if (values.Count == 0)
        {
#pragma warning disable EF1002 // Risk of vulnerability to SQL injection.
            return UserEventFilterStubDbSet
                .FromSqlRaw(
                    $"SELECT NULL{userIdCast} AS {columnNames.UserId}, NULL{sinceCast} AS {columnNames.Since} WHERE 1 = 0"
                )
                .AsNoTracking();
#pragma warning restore EF1002 // Risk of vulnerability to SQL injection.
        }

        var parameters = new object[values.Count * 2];
        var queryStringBuilder = new StringBuilder();

        for (var i = 0; i < values.Count; i++)
        {
            var dataIndex = i * 2;
            queryStringBuilder.Append(
                i == 0
                    ? $"SELECT {{{dataIndex}}}{userIdCast} AS {columnNames.UserId}, {{{dataIndex + 1}}}{sinceCast} AS {columnNames.Since} "
                    : $"UNION SELECT {{{dataIndex}}}{userIdCast}, {{{dataIndex + 1}}}{sinceCast} "
            );

            parameters[dataIndex] = ToProviderValue(userIdMapping, values[i].UserId);
            parameters[dataIndex + 1] = ToProviderValue(sinceMapping, values[i].Since);
        }

        return UserEventFilterStubDbSet
            .FromSqlRaw(queryStringBuilder.ToString(), parameters)
            .AsNoTracking();
    }

    private static object ToProviderValue(RelationalTypeMapping mapping, object value) =>
        mapping.Converter is null ? value : mapping.Converter.ConvertToProvider(value)!;
}
