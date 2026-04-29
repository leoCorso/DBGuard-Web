using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DBGuardAPI.Data.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    normalized_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    concurrency_stamp = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_asp_net_roles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    create_date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    last_edited = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<string>(type: "text", nullable: true),
                    user_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    normalized_user_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    normalized_email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    email_confirmed = table.Column<bool>(type: "boolean", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: true),
                    security_stamp = table.Column<string>(type: "text", nullable: true),
                    concurrency_stamp = table.Column<string>(type: "text", nullable: true),
                    phone_number = table.Column<string>(type: "text", nullable: true),
                    phone_number_confirmed = table.Column<bool>(type: "boolean", nullable: false),
                    two_factor_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    lockout_end = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    lockout_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    access_failed_count = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_asp_net_users", x => x.id);
                    table.ForeignKey(
                        name: "fk_asp_net_users_asp_net_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    role_id = table.Column<string>(type: "text", nullable: false),
                    claim_type = table.Column<string>(type: "text", nullable: true),
                    claim_value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_asp_net_role_claims", x => x.id);
                    table.ForeignKey(
                        name: "fk_asp_net_role_claims_asp_net_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "AspNetRoles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    claim_type = table.Column<string>(type: "text", nullable: true),
                    claim_value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_asp_net_user_claims", x => x.id);
                    table.ForeignKey(
                        name: "fk_asp_net_user_claims_asp_net_users_user_id",
                        column: x => x.user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    login_provider = table.Column<string>(type: "text", nullable: false),
                    provider_key = table.Column<string>(type: "text", nullable: false),
                    provider_display_name = table.Column<string>(type: "text", nullable: true),
                    user_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_asp_net_user_logins", x => new { x.login_provider, x.provider_key });
                    table.ForeignKey(
                        name: "fk_asp_net_user_logins_asp_net_users_user_id",
                        column: x => x.user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    user_id = table.Column<string>(type: "text", nullable: false),
                    role_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_asp_net_user_roles", x => new { x.user_id, x.role_id });
                    table.ForeignKey(
                        name: "fk_asp_net_user_roles_asp_net_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "AspNetRoles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_asp_net_user_roles_asp_net_users_user_id",
                        column: x => x.user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    user_id = table.Column<string>(type: "text", nullable: false),
                    login_provider = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_asp_net_user_tokens", x => new { x.user_id, x.login_provider, x.name });
                    table.ForeignKey(
                        name: "fk_asp_net_user_tokens_asp_net_users_user_id",
                        column: x => x.user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "database_connections",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    end_point = table.Column<string>(type: "text", nullable: false),
                    database_engine = table.Column<int>(type: "integer", nullable: false),
                    database_name = table.Column<string>(type: "text", nullable: false),
                    username = table.Column<string>(type: "text", nullable: true),
                    password = table.Column<string>(type: "text", nullable: true),
                    create_date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    last_edited_date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_database_connections", x => x.id);
                    table.ForeignKey(
                        name: "fk_database_connections_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "notification_providers",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    create_date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    last_edited_date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<string>(type: "text", nullable: false),
                    provider_type = table.Column<int>(type: "integer", nullable: false),
                    smtp_server = table.Column<string>(type: "text", nullable: true),
                    username = table.Column<string>(type: "text", nullable: true),
                    password = table.Column<string>(type: "text", nullable: true),
                    port = table.Column<int>(type: "integer", nullable: true),
                    sender_email = table.Column<string>(type: "text", nullable: true),
                    phone_number = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notification_providers", x => x.id);
                    table.ForeignKey(
                        name: "fk_notification_providers_asp_net_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "guards",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    guard_name = table.Column<string>(type: "text", nullable: true),
                    guard_description = table.Column<string>(type: "text", nullable: true),
                    create_date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<string>(type: "text", nullable: false),
                    last_edited_date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    trigger_query = table.Column<string>(type: "text", nullable: false),
                    count_column = table.Column<string>(type: "text", nullable: false),
                    trigger_operator = table.Column<int>(type: "integer", nullable: false),
                    trigger_value = table.Column<int>(type: "integer", nullable: false),
                    database_connection_id = table.Column<int>(type: "integer", nullable: false),
                    guard_state = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    notify_on_clear = table.Column<bool>(type: "boolean", nullable: false),
                    notify_on_error = table.Column<bool>(type: "boolean", nullable: false),
                    notify_on_trigger = table.Column<bool>(type: "boolean", nullable: false),
                    total_errors = table.Column<int>(type: "integer", nullable: false),
                    total_triggers = table.Column<int>(type: "integer", nullable: false),
                    last_run = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    run_period_in_minutes = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_guards", x => x.id);
                    table.ForeignKey(
                        name: "fk_guards_database_connections_database_connection_id",
                        column: x => x.database_connection_id,
                        principalTable: "database_connections",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_guards_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "guard_change_transactions",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    timestamp = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guard_id = table.Column<int>(type: "integer", nullable: true),
                    guard_state = table.Column<int>(type: "integer", nullable: false),
                    previous_guard_state = table.Column<int>(type: "integer", nullable: false),
                    guard_query = table.Column<string>(type: "text", nullable: false),
                    guard_operator = table.Column<int>(type: "integer", nullable: false),
                    guard_value = table.Column<int>(type: "integer", nullable: false),
                    result_value = table.Column<int>(type: "integer", nullable: true),
                    message = table.Column<string>(type: "text", nullable: true),
                    database_connection_id = table.Column<int>(type: "integer", nullable: true),
                    database_connection_end_point = table.Column<string>(type: "text", nullable: false),
                    database_connection_engine = table.Column<int>(type: "integer", nullable: false),
                    database_name = table.Column<string>(type: "text", nullable: false),
                    database_connection_username = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_guard_change_transactions", x => x.id);
                    table.ForeignKey(
                        name: "fk_guard_change_transactions_database_connections_database_con",
                        column: x => x.database_connection_id,
                        principalTable: "database_connections",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_guard_change_transactions_guards_guard_id",
                        column: x => x.guard_id,
                        principalTable: "guards",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "guard_notifications",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    guard_id = table.Column<int>(type: "integer", nullable: false),
                    notification_type = table.Column<int>(type: "integer", nullable: false),
                    create_date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    last_edited = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    notification_provider_id = table.Column<int>(type: "integer", nullable: false),
                    email_subject = table.Column<string>(type: "text", nullable: true),
                    email_body = table.Column<string>(type: "text", nullable: true),
                    to_emails = table.Column<List<string>>(type: "text[]", nullable: true),
                    cc_emails = table.Column<List<string>>(type: "text[]", nullable: true),
                    bcc_emails = table.Column<List<string>>(type: "text[]", nullable: true),
                    phone_numbers = table.Column<List<string>>(type: "text[]", nullable: true),
                    text_message = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_guard_notifications", x => x.id);
                    table.ForeignKey(
                        name: "fk_guard_notifications_guards_guard_id",
                        column: x => x.guard_id,
                        principalTable: "guards",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_guard_notifications_notification_providers_notification_pro",
                        column: x => x.notification_provider_id,
                        principalTable: "notification_providers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "notification_transactions",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    timestamp = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    guard_id = table.Column<int>(type: "integer", nullable: true),
                    guard_notification_id = table.Column<int>(type: "integer", nullable: true),
                    notification_type = table.Column<int>(type: "integer", nullable: false),
                    guard_change_transaction_id = table.Column<int>(type: "integer", nullable: false),
                    successful = table.Column<bool>(type: "boolean", nullable: false),
                    error_message = table.Column<string>(type: "text", nullable: true),
                    email_subject = table.Column<string>(type: "text", nullable: true),
                    email_body = table.Column<string>(type: "text", nullable: true),
                    to_emails = table.Column<List<string>>(type: "text[]", nullable: true),
                    cc_emails = table.Column<List<string>>(type: "text[]", nullable: true),
                    bcc_emails = table.Column<List<string>>(type: "text[]", nullable: true),
                    phone_numbers = table.Column<string>(type: "text", nullable: true),
                    text_message = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notification_transactions", x => x.id);
                    table.ForeignKey(
                        name: "fk_notification_transactions_guard_change_transactions_guard_c",
                        column: x => x.guard_change_transaction_id,
                        principalTable: "guard_change_transactions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_notification_transactions_guard_notifications_guard_notific",
                        column: x => x.guard_notification_id,
                        principalTable: "guard_notifications",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_notification_transactions_guards_guard_id",
                        column: x => x.guard_id,
                        principalTable: "guards",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "ix_asp_net_role_claims_role_id",
                table: "AspNetRoleClaims",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "normalized_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_asp_net_user_claims_user_id",
                table: "AspNetUserClaims",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_asp_net_user_logins_user_id",
                table: "AspNetUserLogins",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_asp_net_user_roles_role_id",
                table: "AspNetUserRoles",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "normalized_email");

            migrationBuilder.CreateIndex(
                name: "ix_asp_net_users_created_by_user_id",
                table: "AspNetUsers",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "normalized_user_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_database_connections_created_by_user_id",
                table: "database_connections",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_guard_change_transactions_database_connection_id",
                table: "guard_change_transactions",
                column: "database_connection_id");

            migrationBuilder.CreateIndex(
                name: "ix_guard_change_transactions_guard_id",
                table: "guard_change_transactions",
                column: "guard_id");

            migrationBuilder.CreateIndex(
                name: "ix_guard_notifications_guard_id",
                table: "guard_notifications",
                column: "guard_id");

            migrationBuilder.CreateIndex(
                name: "ix_guard_notifications_notification_provider_id",
                table: "guard_notifications",
                column: "notification_provider_id");

            migrationBuilder.CreateIndex(
                name: "ix_guards_created_by_user_id",
                table: "guards",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_guards_database_connection_id",
                table: "guards",
                column: "database_connection_id");

            migrationBuilder.CreateIndex(
                name: "ix_notification_providers_created_by_user_id",
                table: "notification_providers",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_notification_transactions_guard_change_transaction_id",
                table: "notification_transactions",
                column: "guard_change_transaction_id");

            migrationBuilder.CreateIndex(
                name: "ix_notification_transactions_guard_id",
                table: "notification_transactions",
                column: "guard_id");

            migrationBuilder.CreateIndex(
                name: "ix_notification_transactions_guard_notification_id",
                table: "notification_transactions",
                column: "guard_notification_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "notification_transactions");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "guard_change_transactions");

            migrationBuilder.DropTable(
                name: "guard_notifications");

            migrationBuilder.DropTable(
                name: "guards");

            migrationBuilder.DropTable(
                name: "notification_providers");

            migrationBuilder.DropTable(
                name: "database_connections");

            migrationBuilder.DropTable(
                name: "AspNetUsers");
        }
    }
}
