using LinkawyGenie.Common.Domain.Users;

namespace LinkawyGenie.Common.Domain.Conversations;

/// <summary>
/// Specification for retrieving a conversation by its ID.
/// This includes all related messages for complete conversation data.
/// </summary>
public sealed class ConversationByIdSpec : SingleResultSpecification<Conversation>
{
    public ConversationByIdSpec(ConversationId conversationId)
    {
        Query.Where(c => c.Id == conversationId).Include(c => c.Messages);
    }
}

/// <summary>
/// Specification for retrieving conversations by user ID.
/// This provides a base query for user-specific conversations.
/// </summary>
public sealed class ConversationsByUserIdSpec : Specification<Conversation>
{
    public ConversationsByUserIdSpec(UserId userId)
    {
        Query.Where(c => c.UserId == userId);
    }
}

/// <summary>
/// Specification for retrieving conversations with pagination and ordering.
/// This includes proper ordering by last activity for conversation lists.
/// </summary>
public sealed class ConversationsWithPaginationSpec : Specification<Conversation>
{
    public ConversationsWithPaginationSpec()
    {
        // Updated to use the new field names from DB schema
        Query
            .Where(c => !c.IsDeleted) // Only include non-deleted conversations
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving messages by conversation ID.
/// This provides a base query for conversation messages.
/// </summary>
public sealed class MessagesByConversationIdSpec : Specification<Message>
{
    public MessagesByConversationIdSpec(ConversationId conversationId)
    {
        Query.Where(m => m.ConversationId == conversationId).OrderBy(m => m.SequenceNumber);
    }
}

/// <summary>
/// Specification for retrieving recent messages by conversation ID.
/// This orders messages by creation date descending for recent message queries.
/// </summary>
public sealed class RecentMessagesByConversationIdSpec : Specification<Message>
{
    public RecentMessagesByConversationIdSpec(ConversationId conversationId)
    {
        Query.Where(m => m.ConversationId == conversationId).OrderByDescending(m => m.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving conversations by user ID with pagination.
/// This combines user filtering with proper ordering for paginated results.
/// </summary>
public sealed class UserConversationsWithPaginationSpec : Specification<Conversation>
{
    public UserConversationsWithPaginationSpec(UserId userId)
    {
        Query
            .Where(c => c.UserId == userId && !c.IsDeleted) // Only include non-deleted conversations
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving conversations by title search.
/// This enables searching conversations by title content.
/// </summary>
public sealed class ConversationsByTitleSearchSpec : Specification<Conversation>
{
    public ConversationsByTitleSearchSpec(string searchTerm)
    {
        Query
            .Where(c => c.Title != null && c.Title.Value.Contains(searchTerm))
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving conversations created within a date range.
/// This enables filtering conversations by creation date.
/// </summary>
public sealed class ConversationsByDateRangeSpec : Specification<Conversation>
{
    public ConversationsByDateRangeSpec(DateTimeOffset fromDate, DateTimeOffset toDate)
    {
        Query
            .Where(c => c.CreatedAt >= fromDate && c.CreatedAt <= toDate)
            .OrderByDescending(c => c.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving conversations with recent activity.
/// This filters conversations that have been active within a specified time period.
/// </summary>
public sealed class ConversationsWithRecentActivitySpec : Specification<Conversation>
{
    public ConversationsWithRecentActivitySpec(DateTimeOffset since)
    {
        Query
            .Where(c => c.LastMessageAt >= since && !c.IsDeleted) // Only include non-deleted conversations
            .OrderByDescending(c => c.LastMessageAt);
    }
}
