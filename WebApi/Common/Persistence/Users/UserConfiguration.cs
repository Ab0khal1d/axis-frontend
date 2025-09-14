using LinkawyGenie.Common.Domain.Users;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LinkawyGenie.Common.Persistence.Users;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnType("NVARCHAR(128)"); // Matches Entra ID 'oid' claim

        // Email property with uniqueness constraint
        builder.Property(x => x.Email).HasMaxLength(256).IsRequired();
        builder.HasIndex(x => x.Email).IsUnique();

        builder.Property(x => x.DisplayName).HasMaxLength(256).IsRequired();

        builder
            .Property(x => x.IdentityProvider)
            .HasMaxLength(128)
            .IsRequired()
            .HasDefaultValue("entra_id");

        builder.Property(x => x.IsAdmin).IsRequired().HasDefaultValue(false);

        builder.Property(x => x.CreatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.LastLoginAt);

        builder.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);

        builder.Ignore(x => x.Roles);

        // Indexes
        builder.HasIndex(x => x.Email);
    }
}


