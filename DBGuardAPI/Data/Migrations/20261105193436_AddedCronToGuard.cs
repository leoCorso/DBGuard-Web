using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DBGuardAPI.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedCronToGuard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.AddColumn<string>(
                name: "cron_schedule",
                table: "guards",
                type: "text",
                nullable: false,
                defaultValue: "* * * * *");
            // 2. Convert existing run period minutes to cron expression
            migrationBuilder.Sql("""
                UPDATE "guards"
                SET "cron_schedule" = CASE
                    WHEN "run_period_in_minutes" <= 1    THEN '* * * * *'
                    WHEN "run_period_in_minutes" < 60    THEN '*/' || ROUND("run_period_in_minutes")::int || ' * * * *'
                    WHEN "run_period_in_minutes" < 1440  THEN '0 */' || ROUND("run_period_in_minutes" / 60)::int || ' * * *'
                    ELSE '0 0 */' || ROUND("run_period_in_minutes" / 1440)::int || ' * *'
                END;
                """);
            migrationBuilder.DropColumn(
                name: "run_after",
                table: "guards");

            migrationBuilder.DropColumn(
                name: "run_period_in_minutes",
                table: "guards");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "run_after",
                table: "guards",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "run_period_in_minutes",
                table: "guards",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);
            // Convert cron expressions to minutes
            migrationBuilder.Sql("""
                UPDATE "guards"
                SET "run_period_in_minutes" = substring("cron_schedule" from '^\*/(\d+) \* \* \* \*$')::double precision
                WHERE "cron_schedule" ~ '^\*/\d+ \* \* \* \*$';
            """);
            migrationBuilder.DropColumn(
                name: "cron_schedule",
                table: "guards");
        }
    }
}
