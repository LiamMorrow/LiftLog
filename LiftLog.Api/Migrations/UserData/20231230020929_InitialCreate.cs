using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiftLog.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table =>
                    new
                    {
                        Id = table.Column<Guid>(type: "uuid", nullable: false),
                        HashedPassword = table.Column<string>(type: "text", nullable: false),
                        Salt = table.Column<byte[]>(type: "bytea", nullable: false),
                        EncryptedCurrentPlan = table.Column<byte[]>(type: "bytea", nullable: true),
                        EncryptedProfilePicture = table.Column<byte[]>(
                            type: "bytea",
                            nullable: true
                        ),
                        EncryptedName = table.Column<byte[]>(type: "bytea", nullable: true)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "UserEvents",
                columns: table =>
                    new
                    {
                        Id = table.Column<Guid>(type: "uuid", nullable: false),
                        UserId = table.Column<Guid>(type: "uuid", nullable: false),
                        Timestamp = table.Column<DateTimeOffset>(
                            type: "timestamp with time zone",
                            nullable: false
                        ),
                        LastAccessed = table.Column<DateTimeOffset>(
                            type: "timestamp with time zone",
                            nullable: false
                        ),
                        Expiry = table.Column<DateTimeOffset>(
                            type: "timestamp with time zone",
                            nullable: false
                        ),
                        EncryptedEvent = table.Column<byte[]>(type: "bytea", nullable: false)
                    },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserEvents_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_UserEvents_UserId",
                table: "UserEvents",
                column: "UserId"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "UserEvents");

            migrationBuilder.DropTable(name: "Users");
        }
    }
}
