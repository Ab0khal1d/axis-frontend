using LinkawyGenie.Common.Domain.Base;
using LinkawyGenie.Common.Domain.Users;
using OpenAI.Chat;

namespace LinkawyGenie.Common.Domain.Conversations;

[ValueObject<Guid>]
public readonly partial struct MessageId;

public sealed class Message : Entity<MessageId>
{
    public MessageId Id { get; private set; }
    public MessageId? ParentMessageId { get; private set; }
    public ConversationId ConversationId { get; private set; }
    public ChatMessageRole Author { get; private set; }
    public string Content { get; private set; } = null!;
    public int SequenceNumber { get; private set; }

    private Message() { }

    internal Message(
        ConversationId ConversationId,
        MessageId ParentMessageId,
        ChatMessageRole Author,
        string Content
    )
    {
        Id = MessageId.From(Guid.CreateVersion7());
        this.ConversationId = ConversationId;
        this.ParentMessageId = ParentMessageId;
        this.Author = Author;
        this.Content = Content;
        this.SequenceNumber = SequenceNumber;
    }

    /// <summary>
    /// Updates the content of the message.
    /// This is particularly useful for streaming responses where the content builds up over time.
    /// </summary>
    /// <param name="content">The new content to set</param>
    public void UpdateContent(string content)
    {
        Content = content;
    }
}


