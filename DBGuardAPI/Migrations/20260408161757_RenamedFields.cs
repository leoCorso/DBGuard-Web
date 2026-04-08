using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DBGuardAPI.Migrations
{
    /// <inheritdoc />
    public partial class RenamedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_guard_notifications_notification_providers_service_provider",
                table: "guard_notifications");

            migrationBuilder.RenameColumn(
                name: "service_type",
                table: "notification_providers",
                newName: "notification_type");

            migrationBuilder.RenameColumn(
                name: "service_provider_id",
                table: "guard_notifications",
                newName: "notification_provider_id");

            migrationBuilder.RenameIndex(
                name: "ix_guard_notifications_service_provider_id",
                table: "guard_notifications",
                newName: "ix_guard_notifications_notification_provider_id");

            migrationBuilder.AddForeignKey(
                name: "fk_guard_notifications_notification_providers_notification_pro",
                table: "guard_notifications",
                column: "notification_provider_id",
                principalTable: "notification_providers",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_guard_notifications_notification_providers_notification_pro",
                table: "guard_notifications");

            migrationBuilder.RenameColumn(
                name: "notification_type",
                table: "notification_providers",
                newName: "service_type");

            migrationBuilder.RenameColumn(
                name: "notification_provider_id",
                table: "guard_notifications",
                newName: "service_provider_id");

            migrationBuilder.RenameIndex(
                name: "ix_guard_notifications_notification_provider_id",
                table: "guard_notifications",
                newName: "ix_guard_notifications_service_provider_id");

            migrationBuilder.AddForeignKey(
                name: "fk_guard_notifications_notification_providers_service_provider",
                table: "guard_notifications",
                column: "service_provider_id",
                principalTable: "notification_providers",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
