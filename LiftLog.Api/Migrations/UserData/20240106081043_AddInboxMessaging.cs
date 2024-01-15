using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiftLog.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddInboxMessaging : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserFollowSecrets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserFollowSecrets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserFollowSecrets_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "UserInboxItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    EncryptedMessage = table.Column<byte[][]>(type: "bytea[]", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserInboxItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserInboxItems_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_UserFollowSecrets_UserId",
                table: "UserFollowSecrets",
                column: "UserId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_UserInboxItems_UserId",
                table: "UserInboxItems",
                column: "UserId"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "UserFollowSecrets");

            migrationBuilder.DropTable(name: "UserInboxItems");
        }
    }
}
