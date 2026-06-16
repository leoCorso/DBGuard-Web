using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DBGuardAPI.Data.Migrations
{
    /// <inheritdoc />
    public partial class CreatedByNotification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "created_by_user_id",
                table: "guard_notifications",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_guard_notifications_created_by_user_id",
                table: "guard_notifications",
                column: "created_by_user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_guard_notifications_asp_net_users_created_by_user_id",
                table: "guard_notifications",
                column: "created_by_user_id",
                principalTable: "AspNetUsers",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_guard_notifications_asp_net_users_created_by_user_id",
                table: "guard_notifications");

            migrationBuilder.DropIndex(
                name: "ix_guard_notifications_created_by_user_id",
                table: "guard_notifications");

            migrationBuilder.DropColumn(
                name: "created_by_user_id",
                table: "guard_notifications");
        }
    }
}
