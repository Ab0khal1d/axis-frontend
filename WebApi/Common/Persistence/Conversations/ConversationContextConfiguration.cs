//using LinkawyGenie.Common.Domain.Conversations;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.EntityFrameworkCore.Metadata.Builders;

//namespace LinkawyGenie.Common.Persistence.Conversations;

//public class ConversationContextConfiguration : IEntityTypeConfiguration<ConversationContext>
//{
//    public void Configure(EntityTypeBuilder<ConversationContext> builder)
//    {
//        builder.HasKey(x => x.Id);

//        builder.Property(x => x.Id);

//        builder.Property(x => x.ConversationId).IsRequired();

//        builder.Property(x => x.LastMessageId).IsRequired();

//        builder.Property(x => x.ContextData).IsRequired().HasColumnType("NVARCHAR(MAX)");

//        builder.Property(x => x.CreatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");

//        builder.Property(x => x.UpdatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");

//        builder.Property(x => x.ExpiresAt).IsRequired();

//        // Ignore domain-specific properties that aren't in the DB schema
//        builder.Ignore(x => x.Settings);
//        builder.Ignore(x => x.StreamingConfig);
//        builder.Ignore(x => x.ContextMessageCount);
//        builder.Ignore(x => x.IsActive);
//        builder.Ignore(x => x.ContextMessages);
//        builder.Ignore(x => x.RelatedQueries);
//        builder.Ignore(x => x.HasKnowledgeBase);
//        builder.Ignore(x => x.UsesStreaming);
//        builder.Ignore(x => x.IsContextFull);

//        // Define relationships
//        builder
//            .HasOne<Conversation>()
//            .WithOne()
//            .HasForeignKey<ConversationContext>(x => x.ConversationId)
//            .OnDelete(DeleteBehavior.Cascade);

//        builder.HasOne<Message>().WithMany().HasForeignKey(x => x.LastMessageId);

//        // Create indexes based on schema
//        builder.HasIndex(x => x.ConversationId);
//        builder.HasIndex(x => x.LastMessageId);

//        // Configure table name
//        builder.ToTable("ConversationContext", "dbo");
//    }
//}
