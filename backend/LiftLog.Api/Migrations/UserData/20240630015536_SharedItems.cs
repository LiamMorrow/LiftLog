using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LiftLog.Api.Migrations
{
    /// <inheritdoc />
    public partial class SharedItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "shared_items",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    timestamp = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    expiry = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    encrypted_payload = table.Column<byte[]>(type: "bytea", maxLength: 5120, nullable: false),
                    encryption_iv = table.Column<byte[]>(type: "bytea", nullable: false)
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

            migrationBuilder.CreateIndex(
                name: "ix_shared_items_user_id",
                table: "shared_items",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "shared_items");
        }
    }
}
