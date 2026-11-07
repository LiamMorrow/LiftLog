using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiftLog.Api.Migrations.Sqlite.UserData
{
    /// <inheritdoc />
    public partial class AddShareTag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "share_tag",
                table: "users",
                type: "BLOB",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "share_tag",
                table: "users");
        }
    }
}
