using LiftLog.Api.Service;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LiftLog.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSqids : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.AlterColumn<string>(
                name: "user_lookup",
                table: "users",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValueSql: "nextval('user_lookup_sequence')");

            migrationBuilder.AddColumn<string>(name: "id_temp", table:"shared_items", type:"text", nullable:true);

            migrationBuilder.Sql(@"
                UPDATE shared_items
                SET id_temp = id
            ");

            migrationBuilder.AlterColumn<string>(
                name: "id_temp",
                table: "shared_items",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "id",
                table: "shared_items");

            migrationBuilder.RenameColumn(
                name: "id_temp",
                table: "shared_items",
                newName: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_shared_items",
                table: "shared_items",
                column: "id");

            migrationBuilder.DropSequence(
                name: "user_lookup_sequence");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence<int>(
                name: "user_lookup_sequence");

            migrationBuilder.AlterColumn<int>(
                name: "user_lookup",
                table: "users",
                type: "integer",
                nullable: false,
                defaultValueSql: "nextval('user_lookup_sequence')",
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "shared_items",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);
        }
    }
}
