using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Migrations.Internal;

namespace LiftLog.Api.Db;

#pragma warning disable EF1001 // Internal EF Core API usage.
public class CamelCaseHistoryContext(HistoryRepositoryDependencies dependencies)
    : NpgsqlHistoryRepository(dependencies)
#pragma warning restore EF1001 // Internal EF Core API usage.
{
    protected override void ConfigureTable(EntityTypeBuilder<HistoryRow> history)
    {
        base.ConfigureTable(history);

        history.Property(h => h.MigrationId).HasColumnName("MigrationId");
        history.Property(h => h.ProductVersion).HasColumnName("ProductVersion");
    }
}
