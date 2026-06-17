using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DBGuardAPI.Data.Migrations
{
    /// <inheritdoc />
    public partial class GuardRunAfter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "run_after",
                table: "guards",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "run_after",
                table: "guards");
        }
    }
}
