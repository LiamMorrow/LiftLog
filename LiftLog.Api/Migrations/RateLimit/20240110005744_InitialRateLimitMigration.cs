using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiftLog.Api.Migrations.RateLimit
{
    /// <inheritdoc />
    public partial class InitialRateLimitMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RateLimitConsumptions",
                columns: table =>
                    new
                    {
                        Key = table.Column<string>(type: "text", nullable: false),
                        Requests = table.Column<List<DateTimeOffset>>(
                            type: "timestamp with time zone[]",
                            nullable: false
                        )
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RateLimitConsumptions", x => x.Key);
                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "RateLimitConsumptions");
        }
    }
}
