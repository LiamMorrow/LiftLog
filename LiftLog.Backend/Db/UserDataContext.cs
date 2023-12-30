using LiftLog.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace LiftLog.Backend.Db;

public class UserDataContext(DbContextOptions<UserDataContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; } = null!;

    public DbSet<UserEvent> UserEvents { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .Entity<User>()
            .HasMany<UserEvent>()
            .WithOne(x => x.User)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
