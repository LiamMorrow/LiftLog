using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiftLog.Api.Migrations
{
    /// <inheritdoc />
    public partial class UserCreated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "created",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);
            migrationBuilder.Sql(
                "UPDATE users SET created = last_accessed WHERE created IS NULL");
            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "created",
                table: "users",
                type: "timestamp with time zone",
                nullable: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "created",
                table: "users");
        }
    }
}
