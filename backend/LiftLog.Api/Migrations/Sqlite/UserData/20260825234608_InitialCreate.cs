using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiftLog.Api.Migrations.Sqlite.UserData
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    user_lookup = table.Column<string>(type: "TEXT", nullable: false),
                    hashed_password = table.Column<string>(type: "TEXT", nullable: false),
                    last_accessed = table.Column<long>(type: "INTEGER", nullable: false),
                    created = table.Column<long>(type: "INTEGER", nullable: false),
                    salt = table.Column<byte[]>(type: "BLOB", nullable: false),
                    encrypted_current_plan = table.Column<byte[]>(type: "BLOB", nullable: true),
                    encrypted_profile_picture = table.Column<byte[]>(type: "BLOB", nullable: true),
                    encrypted_name = table.Column<byte[]>(type: "BLOB", nullable: true),
                    encryption_iv = table.Column<byte[]>(type: "BLOB", nullable: false),
                    rsa_public_key = table.Column<byte[]>(type: "BLOB", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "shared_items",
                columns: table => new
                {
                    id = table.Column<string>(type: "TEXT", nullable: false),
                    user_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    timestamp = table.Column<long>(type: "INTEGER", nullable: false),
                    expiry = table.Column<long>(type: "INTEGER", nullable: false),
                    encrypted_payload = table.Column<byte[]>(type: "BLOB", maxLength: 20480, nullable: false),
                    encryption_iv = table.Column<byte[]>(type: "BLOB", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_shared_items", x => x.id);
                    table.ForeignKey(
                        name: "fk_shared_items_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_events",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    user_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    timestamp = table.Column<long>(type: "INTEGER", nullable: false),
                    last_accessed = table.Column<long>(type: "INTEGER", nullable: false),
                    expiry = table.Column<long>(type: "INTEGER", nullable: false),
                    encrypted_event = table.Column<byte[]>(type: "BLOB", maxLength: 15360, nullable: false),
                    encryption_iv = table.Column<byte[]>(type: "BLOB", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_events", x => new { x.user_id, x.id });
                    table.ForeignKey(
                        name: "fk_user_events_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_follow_secrets",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    user_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    value = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_follow_secrets", x => x.id);
                    table.ForeignKey(
                        name: "fk_user_follow_secrets_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_inbox_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    user_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    encrypted_message = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_inbox_items", x => x.id);
                    table.ForeignKey(
                        name: "fk_user_inbox_items_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_shared_items_user_id",
                table: "shared_items",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_events_expiry",
                table: "user_events",
                column: "expiry");

            migrationBuilder.CreateIndex(
                name: "ix_user_follow_secrets_user_id",
                table: "user_follow_secrets",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_inbox_items_user_id",
                table: "user_inbox_items",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_users_user_lookup",
                table: "users",
                column: "user_lookup",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "shared_items");

            migrationBuilder.DropTable(
                name: "user_events");

            migrationBuilder.DropTable(
                name: "user_follow_secrets");

            migrationBuilder.DropTable(
                name: "user_inbox_items");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
