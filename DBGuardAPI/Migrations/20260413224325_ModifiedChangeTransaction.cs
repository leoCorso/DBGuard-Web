using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DBGuardAPI.Migrations
{
    /// <inheritdoc />
    public partial class ModifiedChangeTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "previous_guard_state",
                table: "guard_change_transactions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "result_value",
                table: "guard_change_transactions",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "previous_guard_state",
                table: "guard_change_transactions");

            migrationBuilder.DropColumn(
                name: "result_value",
                table: "guard_change_transactions");
        }
    }
}
