using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiftLog.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence<int>(
                name: "user_number_sequence");

            migrationBuilder.AddColumn<int>(
                name: "user_number",
                table: "users",
                type: "integer",
                nullable: false,
                defaultValueSql: "nextval('user_number_sequence')");

            migrationBuilder.CreateIndex(
                name: "ix_users_user_number",
                table: "users",
                column: "user_number",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_users_user_number",
                table: "users");

            migrationBuilder.DropColumn(
                name: "user_number",
                table: "users");

            migrationBuilder.DropSequence(
                name: "user_number_sequence");
        }
    }
}
