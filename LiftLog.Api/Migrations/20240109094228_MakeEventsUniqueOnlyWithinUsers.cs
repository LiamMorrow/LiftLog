using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiftLog.Api.Migrations
{
    /// <inheritdoc />
    public partial class MakeEventsUniqueOnlyWithinUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(name: "PK_UserEvents", table: "UserEvents");

            migrationBuilder.DropIndex(name: "IX_UserEvents_UserId", table: "UserEvents");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserEvents",
                table: "UserEvents",
                columns: ["UserId", "Id"]
            );

            migrationBuilder.CreateIndex(
                name: "IX_UserEvents_Expiry",
                table: "UserEvents",
                column: "Expiry"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(name: "PK_UserEvents", table: "UserEvents");

            migrationBuilder.DropIndex(name: "IX_UserEvents_Expiry", table: "UserEvents");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserEvents",
                table: "UserEvents",
                column: "Id"
            );

            migrationBuilder.CreateIndex(
                name: "IX_UserEvents_UserId",
                table: "UserEvents",
                column: "UserId"
            );
        }
    }
}
