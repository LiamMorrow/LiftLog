using LiftLog.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace LiftLog.Backend.Db;

public class UserDataContext(DbContextOptions<UserDataContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; } = null!;

    public DbSet<UserEvent> UserEvents { get; set; } = null!;

    public DbSet<UserFollowSecret> UserFollowSecrets { get; set; } = null!;

    public DbSet<UserInboxItem> UserInboxItems { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
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
    }
}
