using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DBGuardAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddedCreatedByReferenceToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "created_by_user_id",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_asp_net_users_created_by_user_id",
                table: "AspNetUsers",
                column: "created_by_user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_asp_net_users_asp_net_users_created_by_user_id",
                table: "AspNetUsers",
                column: "created_by_user_id",
                principalTable: "AspNetUsers",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_asp_net_users_asp_net_users_created_by_user_id",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "ix_asp_net_users_created_by_user_id",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "created_by_user_id",
                table: "AspNetUsers");
        }
    }
}
