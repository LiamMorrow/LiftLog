using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiftLog.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserLookup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence<int>(
                name: "user_lookup_sequence");

            migrationBuilder.AddColumn<int>(
                name: "user_lookup",
                table: "users",
                type: "integer",
                nullable: false,
                defaultValueSql: "nextval('user_lookup_sequence')");

            migrationBuilder.CreateIndex(
                name: "ix_users_user_lookup",
                table: "users",
                column: "user_lookup",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_users_user_lookup",
                table: "users");

            migrationBuilder.DropColumn(
                name: "user_lookup",
                table: "users");

            migrationBuilder.DropSequence(
                name: "user_lookup_sequence");
        }
    }
}
