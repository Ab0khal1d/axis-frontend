using LinkawyGenie.Common.Domain.Base;
using LinkawyGenie.Common.Domain.Base.Interfaces;
using LinkawyGenie.Common.Domain.Users;
using OpenAI.Chat;

namespace LinkawyGenie.Common.Domain.Conversations;

[ValueObject<Guid>]
public readonly partial struct ConversationId;

public sealed class Conversation : AggregateRoot<ConversationId>
{
    private readonly List<Message> _messages = [];

    private Conversation() { }

    public UserId UserId { get; private set; }
    public ConversationTitle? Title { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTimeOffset? LastMessageAt { get; private set; }

    public IReadOnlyList<Message> Messages => _messages.AsReadOnly();

    public static Conversation Start(UserId userId)
    {
        var conversation = new Conversation
        {
            Id = ConversationId.From(Guid.CreateVersion7()),
            UserId = userId,
            Title = ConversationTitle.Create("New Chat"),
            IsDeleted = false,
            LastMessageAt = null,
        };

        conversation.AddDomainEvent(new ConversationStartedEvent(conversation));
        return conversation;
    }

    public static Conversation StartWithId(
        ConversationId conversationId,
        UserId userId,
        DateTimeOffset nowUtc
    )
    {
        var conversation = new Conversation
        {
            Id = conversationId,
            UserId = userId,
            Title = ConversationTitle.Create("New Chat"),
            IsDeleted = false,
            LastMessageAt = null,
        };

        conversation.AddDomainEvent(new ConversationStartedEvent(conversation));
        return conversation;
    }

    public Message AddUserMessage(string content, MessageId ParentMessageId)
    {
        ThrowIfNullOrWhiteSpace(content, nameof(content));

        var message = new Message(
            ConversationId: Id,
            ParentMessageId: ParentMessageId,
            Author: ChatMessageRole.User,
            Content: content.Trim()
        );
        _messages.Add(message);

        // Update the conversation metadata
        LastMessageAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new MessageAddedEvent(this, message));
        return message;
    }

    public Message AddAssistantMessage(string content, MessageId ParentMessageId)
    {
        ThrowIfNullOrWhiteSpace(content, nameof(content));

        var message = new Message(
            ConversationId: Id,
            ParentMessageId: ParentMessageId,
            Author: ChatMessageRole.Assistant,
            Content: content.Trim()
        );
        _messages.Add(message);

        // Update the conversation metadata
        LastMessageAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new MessageAddedEvent(this, message));
        return message;
    }

    public Message AddSystemMessage(string content, MessageId ParentMessageId)
    {
        ThrowIfNullOrWhiteSpace(content, nameof(content));

        var message = new Message(
            ConversationId: Id,
            ParentMessageId: ParentMessageId,
            Author: ChatMessageRole.System,
            Content: content.Trim()
        );
        _messages.Add(message);

        // Update the conversation metadata
        LastMessageAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new MessageAddedEvent(this, message));
        return message;
    }

    public void SetTitle(ConversationTitle title)
    {
        Title = title;
        AddDomainEvent(new ConversationTitledEvent(this));
    }

    public void SoftDelete()
    {
        if (IsDeleted)
            return;

        IsDeleted = true;
        AddDomainEvent(new ConversationDeletedEvent(this));
    }

    public void Restore()
    {
        if (!IsDeleted)
            return;

        IsDeleted = false;
        AddDomainEvent(new ConversationRestoredEvent(this));
    }
}

public enum MessageAuthor
{
    User = 1,
    Assistant = 2,
    System = 3,
}

public sealed record ConversationStartedEvent(Conversation Conversation) : IDomainEvent;

public sealed record MessageAddedEvent(Conversation Conversation, Message Message) : IDomainEvent;

public sealed record ConversationTitledEvent(Conversation Conversation) : IDomainEvent;

public sealed record ConversationDeletedEvent(Conversation Conversation) : IDomainEvent;

public sealed record ConversationRestoredEvent(Conversation Conversation) : IDomainEvent;


