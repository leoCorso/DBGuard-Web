using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DBGuardAPI.Migrations
{
    /// <inheritdoc />
    public partial class ChangedTypeNameOnProvider : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "notification_type",
                table: "notification_providers",
                newName: "provider_type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "provider_type",
                table: "notification_providers",
                newName: "notification_type");
        }
    }
}
