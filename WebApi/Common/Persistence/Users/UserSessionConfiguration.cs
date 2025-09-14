//using LinkawyGenie.Common.Domain.Users;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.EntityFrameworkCore.Metadata.Builders;

//namespace LinkawyGenie.Common.Persistence.Users;

//public class UserSessionConfiguration : IEntityTypeConfiguration<UserSession>
//{
//    public void Configure(EntityTypeBuilder<UserSession> builder)
//    {
//        builder.HasKey(x => x.Id);

//        builder.Property(x => x.Id).HasDefaultValueSql("NEWID()");

//        builder.Property(x => x.UserId).IsRequired();

//        builder.Property(x => x.AccessTokenHash).IsRequired().HasMaxLength(256);

//        builder.Property(x => x.RefreshToken).HasMaxLength(256);

//        builder.Property(x => x.DeviceInfo).HasMaxLength(500);

//        builder.Property(x => x.IpAddress).HasMaxLength(45);

//        builder.Property(x => x.ExpiresAt).IsRequired();

//        builder.Property(x => x.CreatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");

//        builder.Property(x => x.LastActivityAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");

//        builder.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);

//        // Define relationships
//        builder
//            .HasOne<User>()
//            .WithMany()
//            .HasForeignKey(x => x.UserId)
//            .OnDelete(DeleteBehavior.Cascade);

//        // Create indexes based on schema
//        builder.HasIndex(x => x.UserId);

//        builder.HasIndex(x => x.AccessTokenHash);

//        builder.HasIndex(x => x.ExpiresAt);

//        builder.HasIndex(x => x.IsActive);

//        // Configure table name
//        builder.ToTable("UserSessions", "dbo");
//    }
//}
