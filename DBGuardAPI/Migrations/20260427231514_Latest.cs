using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DBGuardAPI.Migrations
{
    /// <inheritdoc />
    public partial class Latest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_guards_database_connections_database_connection_id",
                table: "guards");

            migrationBuilder.AddForeignKey(
                name: "fk_guards_database_connections_database_connection_id",
                table: "guards",
                column: "database_connection_id",
                principalTable: "database_connections",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_guards_database_connections_database_connection_id",
                table: "guards");

            migrationBuilder.AddForeignKey(
                name: "fk_guards_database_connections_database_connection_id",
                table: "guards",
                column: "database_connection_id",
                principalTable: "database_connections",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
