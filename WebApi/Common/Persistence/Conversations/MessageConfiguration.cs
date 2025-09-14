using LinkawyGenie.Common.Domain.Conversations;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LinkawyGenie.Common.Persistence.Conversations;

public class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnType("NVARCHAR(128)");

        builder.Property(x => x.ConversationId).HasColumnType("NVARCHAR(128)").IsRequired();

        // Sequence Column is Identity Column
        builder.Property(x => x.SequenceNumber).UseIdentityColumn();

        // Handle parent message ID
        builder.Property(x => x.ParentMessageId).HasColumnType("NVARCHAR(128)");

        // Role column with check constraint in DB
        builder
            .Property(x => x.Author)
            .HasColumnName("Role")
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Content).HasColumnType("NVARCHAR(MAX)").IsRequired();

        builder.Property(x => x.CreatedAt).IsRequired();

        // Indexes
        builder.HasIndex(x => x.ConversationId);
        builder.HasIndex(x => x.ParentMessageId);
    }
}


