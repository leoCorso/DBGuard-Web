using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DBGuardAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddedMessageToGuardChange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "message",
                table: "guard_change_transactions",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "message",
                table: "guard_change_transactions");
        }
    }
}
