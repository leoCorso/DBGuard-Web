using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DBGuardAPI.Migrations
{
    /// <inheritdoc />
    public partial class NullableGuardCreator : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_guards_users_created_by_user_id",
                table: "guards");

            migrationBuilder.AlterColumn<string>(
                name: "created_by_user_id",
                table: "guards",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddForeignKey(
                name: "fk_guards_users_created_by_user_id",
                table: "guards",
                column: "created_by_user_id",
                principalTable: "AspNetUsers",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_guards_users_created_by_user_id",
                table: "guards");

            migrationBuilder.AlterColumn<string>(
                name: "created_by_user_id",
                table: "guards",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "fk_guards_users_created_by_user_id",
                table: "guards",
                column: "created_by_user_id",
                principalTable: "AspNetUsers",
                principalColumn: "id");
        }
    }
}
