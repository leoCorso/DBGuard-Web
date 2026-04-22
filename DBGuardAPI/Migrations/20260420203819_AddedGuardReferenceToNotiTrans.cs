using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DBGuardAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddedGuardReferenceToNotiTrans : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "guard_id",
                table: "notification_transactions",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_notification_transactions_guard_id",
                table: "notification_transactions",
                column: "guard_id");

            migrationBuilder.CreateIndex(
                name: "ix_notification_transactions_guard_notification_id",
                table: "notification_transactions",
                column: "guard_notification_id");

            migrationBuilder.AddForeignKey(
                name: "fk_notification_transactions_guard_notifications_guard_notific",
                table: "notification_transactions",
                column: "guard_notification_id",
                principalTable: "guard_notifications",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_notification_transactions_guards_guard_id",
                table: "notification_transactions",
                column: "guard_id",
                principalTable: "guards",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_notification_transactions_guard_notifications_guard_notific",
                table: "notification_transactions");

            migrationBuilder.DropForeignKey(
                name: "fk_notification_transactions_guards_guard_id",
                table: "notification_transactions");

            migrationBuilder.DropIndex(
                name: "ix_notification_transactions_guard_id",
                table: "notification_transactions");

            migrationBuilder.DropIndex(
                name: "ix_notification_transactions_guard_notification_id",
                table: "notification_transactions");

            migrationBuilder.DropColumn(
                name: "guard_id",
                table: "notification_transactions");
        }
    }
}
