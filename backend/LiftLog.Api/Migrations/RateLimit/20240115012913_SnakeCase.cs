using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiftLog.Api.Migrations.RateLimit
{
    /// <inheritdoc />
    public partial class SnakeCase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_RateLimitConsumptions",
                table: "RateLimitConsumptions"
            );

            migrationBuilder.RenameTable(
                name: "RateLimitConsumptions",
                newName: "rate_limit_consumptions"
            );

            migrationBuilder.RenameColumn(
                name: "Requests",
                table: "rate_limit_consumptions",
                newName: "requests"
            );

            migrationBuilder.RenameColumn(
                name: "Key",
                table: "rate_limit_consumptions",
                newName: "key"
            );

            migrationBuilder.AddPrimaryKey(
                name: "pk_rate_limit_consumptions",
                table: "rate_limit_consumptions",
                column: "key"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "pk_rate_limit_consumptions",
                table: "rate_limit_consumptions"
            );

            migrationBuilder.RenameTable(
                name: "rate_limit_consumptions",
                newName: "RateLimitConsumptions"
            );

            migrationBuilder.RenameColumn(
                name: "requests",
                table: "RateLimitConsumptions",
                newName: "Requests"
            );

            migrationBuilder.RenameColumn(
                name: "key",
                table: "RateLimitConsumptions",
                newName: "Key"
            );

            migrationBuilder.AddPrimaryKey(
                name: "PK_RateLimitConsumptions",
                table: "RateLimitConsumptions",
                column: "Key"
            );
        }
    }
}
