using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace LiftLog.Api.Db.Sqlite;

public static class SqliteModelExtensions
{
    /// <summary>
    /// SQLite has no native date type, so EF stores a DateTimeOffset as TEXT including its original
    /// offset and compares it as a string. Expiry and Since arrive from clients with whatever offset
    /// they chose, so string comparison would filter and expire the wrong rows. Storing UTC ticks as
    /// an INTEGER makes ordering and range queries correct regardless of the incoming offset.
    /// </summary>
    public static ModelBuilder StoreDateTimeOffsetsAsUtcTicks(this ModelBuilder modelBuilder)
    {
        var converter = new ValueConverter<DateTimeOffset, long>(
            value => value.UtcTicks,
            ticks => new DateTimeOffset(ticks, TimeSpan.Zero)
        );

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (
                    property.ClrType == typeof(DateTimeOffset)
                    || property.ClrType == typeof(DateTimeOffset?)
                )
                {
                    property.SetValueConverter(converter);
                }
            }
        }

        return modelBuilder;
    }
}
