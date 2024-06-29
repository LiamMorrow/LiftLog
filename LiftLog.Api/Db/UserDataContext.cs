using LiftLog.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LiftLog.Api.Db;

public class UserDataContext(DbContextOptions<UserDataContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; } = null!;

    public DbSet<UserEvent> UserEvents { get; set; } = null!;

    public DbSet<UserFollowSecret> UserFollowSecrets { get; set; } = null!;

    public DbSet<UserInboxItem> UserInboxItems { get; set; } = null!;

    /// <summary>
    /// Used to register the user event filter tuple type as a DbSet for use in FromSqlRaw.
    /// </summary>
    public DbSet<UserEventFilter> UserEventFilterStubDbSet { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .Entity<UserEventFilter>()
            .HasNoKey()
            .ToTable("tmp_stub_table", t => t.ExcludeFromMigrations());

        modelBuilder.HasSequence<int>("user_lookup_sequence");

        modelBuilder
            .Entity<User>()
            .Property(x => x.UserLookup)
            .HasDefaultValueSql("nextval('user_lookup_sequence')");

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

        modelBuilder.Entity<UserEvent>().HasIndex(x => x.Expiry);

        modelBuilder.Entity<UserEvent>().HasKey(x => new { x.UserId, x.Id });
    }
}
