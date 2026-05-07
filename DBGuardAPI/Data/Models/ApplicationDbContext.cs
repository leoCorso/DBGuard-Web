using DBGuardAPI.Data.Enums;
using DBGuardAPI.Data.Models.GuardNotifications;
using DBGuardAPI.Data.Models.NotificationProviders;
using DBGuardAPI.Data.Models.NotificationTransactions;
using DBGuardAPI.Data.Models.ServiceProviders;
using DBGuardAPI.Data.Views;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DBGuardAPI.Data.Models
{
    public class ApplicationDbContext: IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<RefreshToken>(refreshToken =>
            {
                refreshToken.HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            });
            builder.Entity<User>(user =>
            {
                user.HasMany(u => u.Guards)
                    .WithOne(g => g.CreatedByUser)
                    .HasForeignKey(g => g.CreatedByUserId)
                    .OnDelete(DeleteBehavior.NoAction);
                user.HasMany(u => u.DatabaseConnections)
                    .WithOne(dc => dc.CreatedByUser)
                    .HasForeignKey(dc => dc.CreatedByUserId)
                    .OnDelete(DeleteBehavior.NoAction);
                user.HasMany(u => u.NotificationProviders)
                    .WithOne(sp => sp.CreatedByUser)
                    .HasForeignKey(sp => sp.CreatedByUserId)
                    .OnDelete(DeleteBehavior.NoAction);
                user.HasOne(u => u.CreatedByUser)
                    .WithMany(u => u.CreatedUsers)
                    .HasForeignKey(u => u.CreatedByUserId)
                    .IsRequired(false)
                    .OnDelete(DeleteBehavior.SetNull);

            });
            builder.Entity<DatabaseConnection>(databaseConnection =>
            {
                databaseConnection.HasMany(dc => dc.Guards)
                    .WithOne(g => g.DatabaseConnection)
                    .HasForeignKey(g => g.DatabaseConnectionId)
                    .OnDelete(DeleteBehavior.Restrict);
                databaseConnection.HasMany(dc => dc.GuardChangeTransactions)
                    .WithOne(gct => gct.DatabaseConnection)
                    .HasForeignKey(gct => gct.DatabaseConnectionId)
                    .OnDelete(DeleteBehavior.SetNull);
            });
            builder.Entity<NotificationProvider>(notificationProvider =>
            {
                notificationProvider.HasDiscriminator<NotificationType>(nameof(NotificationProvider.ProviderType))
                .HasValue<EmailProvider>(NotificationType.Email)
                .HasValue<HTTPProvider>(NotificationType.HTTP);
                notificationProvider.HasMany(sp => sp.GuardNotifications)
                    .WithOne(gn => gn.NotificationProvider)
                    .HasForeignKey(gn => gn.NotificationProviderId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
            builder.Entity<Guard>(guard =>
            {
                guard.HasMany(g => g.GuardNotifications)
                    .WithOne(gn => gn.Guard)
                    .HasForeignKey(gn => gn.GuardId)
                    .OnDelete(DeleteBehavior.Cascade);
                guard.HasMany(g => g.GuardChangeTransactions)
                    .WithOne(gct => gct.Guard)
                    .HasForeignKey(gct => gct.GuardId)
                    .OnDelete(DeleteBehavior.SetNull);
                guard.HasMany(g => g.NotificationTransactions)
                    .WithOne(gnt => gnt.Guard)
                    .HasForeignKey(gnt => gnt.GuardId)
                    .OnDelete(DeleteBehavior.SetNull);
            });
            builder.Entity<GuardView>(guardView =>
            {
                guardView.HasKey(g => g.Id);
                guardView.ToView("guard_view");
            });
            builder.Entity<NotificationTransaction>(notificationTransactions =>
            {
                notificationTransactions.HasDiscriminator<NotificationType>(nameof(NotificationTransaction.NotificationType))
                .HasValue<EmailNotificationTransaction>(NotificationType.Email)
                .HasValue<HTTPNotificationTransaction>(NotificationType.HTTP);

                notificationTransactions.HasOne(nt => nt.GuardChangeTransaction)
                    .WithMany(gct => gct.NotificationTransactions)
                    .HasForeignKey(nt => nt.GuardChangeTransactionId)
                    .IsRequired(false)
                    .OnDelete(DeleteBehavior.Cascade);
            });
            builder.Entity<HTTPNotificationTransaction>(httpTransaction =>
            {
                httpTransaction
                    .Property(ht => ht.RequestHeaders)
                    .HasColumnType("jsonb");
                httpTransaction
                    .Property(ht => ht.QueryParameters)
                    .HasColumnType("jsonb");
            });
            builder.Entity<GuardNotification>(guardNotification =>
            {
                guardNotification.HasDiscriminator<NotificationType>(nameof(GuardNotification.NotificationType))
                .HasValue<EmailNotification>(NotificationType.Email)
                .HasValue<HTTPNotification>(NotificationType.HTTP);
                guardNotification
                .HasMany(gn => gn.NotificationTransactions)
                .WithOne(nt => nt.GuardNotification)
                .HasForeignKey(nt => nt.GuardNotificationId)
                .OnDelete(DeleteBehavior.SetNull);
            });
            builder.Entity<HTTPNotification>(httpNotification =>
            {
                httpNotification
                .Property(hn => hn.RequestHeaders)
                .HasColumnType("jsonb");
                httpNotification
                .Property(hn => hn.QueryParameters)
                .HasColumnType("jsonb");
            });
            base.OnModelCreating(builder);
        }
        public DbSet<Guard> Guards { get; set; }
        public DbSet<GuardView> GuardView { get; set; }
        public DbSet<DatabaseConnection> DatabaseConnections { get; set; }
        public DbSet<GuardNotification> GuardNotifications { get; set; }
        public DbSet<GuardChangeTransaction> GuardChangeTransactions { get; set; }
        public DbSet<NotificationProvider> NotificationProviders { get; set; }
        public DbSet<NotificationTransaction> NotificationTransactions { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

    }
}
