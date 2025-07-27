using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiftLog.Api.Migrations
{
    /// <inheritdoc />
    public partial class SnakeCase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserEvents_Users_UserId",
                table: "UserEvents"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_UserFollowSecrets_Users_UserId",
                table: "UserFollowSecrets"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_UserInboxItems_Users_UserId",
                table: "UserInboxItems"
            );

            migrationBuilder.DropPrimaryKey(name: "PK_Users", table: "Users");

            migrationBuilder.DropPrimaryKey(name: "PK_UserInboxItems", table: "UserInboxItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserFollowSecrets",
                table: "UserFollowSecrets"
            );

            migrationBuilder.DropPrimaryKey(name: "PK_UserEvents", table: "UserEvents");

            migrationBuilder.RenameTable(name: "Users", newName: "users");

            migrationBuilder.RenameTable(name: "UserInboxItems", newName: "user_inbox_items");

            migrationBuilder.RenameTable(name: "UserFollowSecrets", newName: "user_follow_secrets");

            migrationBuilder.RenameTable(name: "UserEvents", newName: "user_events");

            migrationBuilder.RenameColumn(name: "Salt", table: "users", newName: "salt");

            migrationBuilder.RenameColumn(name: "Id", table: "users", newName: "id");

            migrationBuilder.RenameColumn(
                name: "LastAccessed",
                table: "users",
                newName: "last_accessed"
            );

            migrationBuilder.RenameColumn(
                name: "HashedPassword",
                table: "users",
                newName: "hashed_password"
            );

            migrationBuilder.RenameColumn(
                name: "EncryptionIV",
                table: "users",
                newName: "encryption_iv"
            );

            migrationBuilder.RenameColumn(
                name: "EncryptedProfilePicture",
                table: "users",
                newName: "encrypted_profile_picture"
            );

            migrationBuilder.RenameColumn(
                name: "EncryptedName",
                table: "users",
                newName: "encrypted_name"
            );

            migrationBuilder.RenameColumn(
                name: "EncryptedCurrentPlan",
                table: "users",
                newName: "encrypted_current_plan"
            );

            migrationBuilder.RenameColumn(name: "Id", table: "user_inbox_items", newName: "id");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "user_inbox_items",
                newName: "user_id"
            );

            migrationBuilder.RenameColumn(
                name: "EncryptedMessage",
                table: "user_inbox_items",
                newName: "encrypted_message"
            );

            migrationBuilder.RenameIndex(
                name: "IX_UserInboxItems_UserId",
                table: "user_inbox_items",
                newName: "ix_user_inbox_items_user_id"
            );

            migrationBuilder.RenameColumn(
                name: "Value",
                table: "user_follow_secrets",
                newName: "value"
            );

            migrationBuilder.RenameColumn(name: "Id", table: "user_follow_secrets", newName: "id");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "user_follow_secrets",
                newName: "user_id"
            );

            migrationBuilder.RenameIndex(
                name: "IX_UserFollowSecrets_UserId",
                table: "user_follow_secrets",
                newName: "ix_user_follow_secrets_user_id"
            );

            migrationBuilder.RenameColumn(
                name: "Timestamp",
                table: "user_events",
                newName: "timestamp"
            );

            migrationBuilder.RenameColumn(name: "Expiry", table: "user_events", newName: "expiry");

            migrationBuilder.RenameColumn(name: "Id", table: "user_events", newName: "id");

            migrationBuilder.RenameColumn(
                name: "LastAccessed",
                table: "user_events",
                newName: "last_accessed"
            );

            migrationBuilder.RenameColumn(
                name: "EncryptionIV",
                table: "user_events",
                newName: "encryption_iv"
            );

            migrationBuilder.RenameColumn(
                name: "EncryptedEvent",
                table: "user_events",
                newName: "encrypted_event"
            );

            migrationBuilder.RenameColumn(name: "UserId", table: "user_events", newName: "user_id");

            migrationBuilder.RenameIndex(
                name: "IX_UserEvents_Expiry",
                table: "user_events",
                newName: "ix_user_events_expiry"
            );

            migrationBuilder.AddPrimaryKey(name: "pk_users", table: "users", column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_user_inbox_items",
                table: "user_inbox_items",
                column: "id"
            );

            migrationBuilder.AddPrimaryKey(
                name: "pk_user_follow_secrets",
                table: "user_follow_secrets",
                column: "id"
            );

            migrationBuilder.AddPrimaryKey(
                name: "pk_user_events",
                table: "user_events",
                columns: new[] { "user_id", "id" }
            );

            migrationBuilder.AddForeignKey(
                name: "fk_user_events_users_user_id",
                table: "user_events",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "fk_user_follow_secrets_users_user_id",
                table: "user_follow_secrets",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "fk_user_inbox_items_users_user_id",
                table: "user_inbox_items",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_user_events_users_user_id",
                table: "user_events"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_user_follow_secrets_users_user_id",
                table: "user_follow_secrets"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_user_inbox_items_users_user_id",
                table: "user_inbox_items"
            );

            migrationBuilder.DropPrimaryKey(name: "pk_users", table: "users");

            migrationBuilder.DropPrimaryKey(name: "pk_user_inbox_items", table: "user_inbox_items");

            migrationBuilder.DropPrimaryKey(
                name: "pk_user_follow_secrets",
                table: "user_follow_secrets"
            );

            migrationBuilder.DropPrimaryKey(name: "pk_user_events", table: "user_events");

            migrationBuilder.RenameTable(name: "users", newName: "Users");

            migrationBuilder.RenameTable(name: "user_inbox_items", newName: "UserInboxItems");

            migrationBuilder.RenameTable(name: "user_follow_secrets", newName: "UserFollowSecrets");

            migrationBuilder.RenameTable(name: "user_events", newName: "UserEvents");

            migrationBuilder.RenameColumn(name: "salt", table: "Users", newName: "Salt");

            migrationBuilder.RenameColumn(name: "id", table: "Users", newName: "Id");

            migrationBuilder.RenameColumn(
                name: "last_accessed",
                table: "Users",
                newName: "LastAccessed"
            );

            migrationBuilder.RenameColumn(
                name: "hashed_password",
                table: "Users",
                newName: "HashedPassword"
            );

            migrationBuilder.RenameColumn(
                name: "encryption_iv",
                table: "Users",
                newName: "EncryptionIV"
            );

            migrationBuilder.RenameColumn(
                name: "encrypted_profile_picture",
                table: "Users",
                newName: "EncryptedProfilePicture"
            );

            migrationBuilder.RenameColumn(
                name: "encrypted_name",
                table: "Users",
                newName: "EncryptedName"
            );

            migrationBuilder.RenameColumn(
                name: "encrypted_current_plan",
                table: "Users",
                newName: "EncryptedCurrentPlan"
            );

            migrationBuilder.RenameColumn(name: "id", table: "UserInboxItems", newName: "Id");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "UserInboxItems",
                newName: "UserId"
            );

            migrationBuilder.RenameColumn(
                name: "encrypted_message",
                table: "UserInboxItems",
                newName: "EncryptedMessage"
            );

            migrationBuilder.RenameIndex(
                name: "ix_user_inbox_items_user_id",
                table: "UserInboxItems",
                newName: "IX_UserInboxItems_UserId"
            );

            migrationBuilder.RenameColumn(
                name: "value",
                table: "UserFollowSecrets",
                newName: "Value"
            );

            migrationBuilder.RenameColumn(name: "id", table: "UserFollowSecrets", newName: "Id");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "UserFollowSecrets",
                newName: "UserId"
            );

            migrationBuilder.RenameIndex(
                name: "ix_user_follow_secrets_user_id",
                table: "UserFollowSecrets",
                newName: "IX_UserFollowSecrets_UserId"
            );

            migrationBuilder.RenameColumn(
                name: "timestamp",
                table: "UserEvents",
                newName: "Timestamp"
            );

            migrationBuilder.RenameColumn(name: "expiry", table: "UserEvents", newName: "Expiry");

            migrationBuilder.RenameColumn(name: "id", table: "UserEvents", newName: "Id");

            migrationBuilder.RenameColumn(
                name: "last_accessed",
                table: "UserEvents",
                newName: "LastAccessed"
            );

            migrationBuilder.RenameColumn(
                name: "encryption_iv",
                table: "UserEvents",
                newName: "EncryptionIV"
            );

            migrationBuilder.RenameColumn(
                name: "encrypted_event",
                table: "UserEvents",
                newName: "EncryptedEvent"
            );

            migrationBuilder.RenameColumn(name: "user_id", table: "UserEvents", newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "ix_user_events_expiry",
                table: "UserEvents",
                newName: "IX_UserEvents_Expiry"
            );

            migrationBuilder.AddPrimaryKey(name: "PK_Users", table: "Users", column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserInboxItems",
                table: "UserInboxItems",
                column: "Id"
            );

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserFollowSecrets",
                table: "UserFollowSecrets",
                column: "Id"
            );

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserEvents",
                table: "UserEvents",
                columns: new[] { "UserId", "Id" }
            );

            migrationBuilder.AddForeignKey(
                name: "FK_UserEvents_Users_UserId",
                table: "UserEvents",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_UserFollowSecrets_Users_UserId",
                table: "UserFollowSecrets",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_UserInboxItems_Users_UserId",
                table: "UserInboxItems",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }
    }
}
