using LinkawyGenie.Common.Domain.Conversations;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LinkawyGenie.Common.Persistence.Conversations;

public class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        builder.HasKey(x => x.Id);
        builder
            .Property(x => x.Id)
            .HasConversion(id => id.Value, guid => ConversationId.From(guid))
            .HasColumnType("NVARCHAR(128)");

        builder
            .Property(x => x.UserId)
            .HasConversion(id => id.Value, guid => Common.Domain.Users.UserId.From(guid))
            .HasColumnType("NVARCHAR(128)")
            .IsRequired();

        builder.OwnsOne(
            x => x.Title,
            title =>
            {
                title
                    .Property(p => p.Value)
                    .HasColumnName("Title")
                    .HasMaxLength(500) // Updated to match schema
                    .HasDefaultValue("New Chat");

                title.HasIndex(nameof(ConversationTitle.Value));
            }
        );

        builder.Property(x => x.IsDeleted).IsRequired().HasDefaultValue(false);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.LastMessageAt).HasColumnName("LastMessageAt");

        builder
            .HasMany(c => c.Messages)
            .WithOne()
            .HasForeignKey(m => m.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.IsDeleted);
    }
}


