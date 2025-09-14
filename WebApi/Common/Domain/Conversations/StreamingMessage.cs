using LinkawyGenie.Common.Domain.Base.Interfaces;

namespace LinkawyGenie.Common.Domain.Conversations;

/// <summary>
/// Value object representing the status of a streaming message.
/// This tracks the lifecycle of real-time message streaming.
/// </summary>
public sealed class StreamingStatus : IValueObject
{
    private StreamingStatus(string value)
    {
        Value = value;
    }

    public string Value { get; }

    public static StreamingStatus Create(string value)
    {
        ThrowIfNullOrWhiteSpace(value, nameof(value));
        var trimmed = value.Trim().ToLowerInvariant();

        return trimmed switch
        {
            "pending" => new StreamingStatus("pending"),
            "streaming" => new StreamingStatus("streaming"),
            "completed" => new StreamingStatus("completed"),
            "failed" => new StreamingStatus("failed"),
            "cancelled" => new StreamingStatus("cancelled"),
            _ => throw new ArgumentException($"Invalid streaming status: {value}", nameof(value)),
        };
    }

    public static StreamingStatus Pending() => new("pending");

    public static StreamingStatus Streaming() => new("streaming");

    public static StreamingStatus Completed() => new("completed");

    public static StreamingStatus Failed() => new("failed");

    public static StreamingStatus Cancelled() => new("cancelled");

    public bool IsPending => Value == "pending";
    public bool IsStreaming => Value == "streaming";
    public bool IsCompleted => Value == "completed";
    public bool IsFailed => Value == "failed";
    public bool IsCancelled => Value == "cancelled";
    public bool IsActive => IsPending || IsStreaming;

    public bool Equals(StreamingStatus? other) =>
        other is not null && Value.Equals(other.Value, StringComparison.OrdinalIgnoreCase);

    public override bool Equals(object? obj) => Equals(obj as StreamingStatus);

    public override int GetHashCode() => Value.GetHashCode(StringComparison.OrdinalIgnoreCase);

    public override string ToString() => Value;
}

/// <summary>
/// Value object representing a chunk of streaming content.
/// This encapsulates individual pieces of content being streamed to the client.
/// </summary>
public sealed class StreamingChunk : IValueObject
{
    public const int MaxChunkSize = 1000;

    private StreamingChunk(string content, int sequenceNumber, bool isLast)
    {
        Content = content;
        SequenceNumber = sequenceNumber;
        IsLast = isLast;
    }

    public string Content { get; }
    public int SequenceNumber { get; }
    public bool IsLast { get; }

    public static StreamingChunk Create(string content, int sequenceNumber, bool isLast = false)
    {
        ThrowIfNull(content, nameof(content));
        ThrowIfLessThan(sequenceNumber, 0, nameof(sequenceNumber));
        ThrowIfGreaterThan(content.Length, MaxChunkSize, nameof(content));

        return new StreamingChunk(content, sequenceNumber, isLast);
    }

    public bool Equals(StreamingChunk? other) =>
        other is not null
        && Content == other.Content
        && SequenceNumber == other.SequenceNumber
        && IsLast == other.IsLast;

    public override bool Equals(object? obj) => Equals(obj as StreamingChunk);

    public override int GetHashCode() => HashCode.Combine(Content, SequenceNumber, IsLast);

    public override string ToString() =>
        $"Chunk {SequenceNumber}: {Content[..Math.Min(50, Content.Length)]}...";
}

/// <summary>
/// Value object representing metadata for streaming operations.
/// This provides additional context and timing information for streamed content.
/// </summary>
public sealed class StreamingMetadata : IValueObject
{
    private StreamingMetadata(
        DateTimeOffset startTime,
        TimeSpan? estimatedDuration,
        int? totalChunks,
        string? modelName,
        Dictionary<string, string>? additionalData
    )
    {
        StartTime = startTime;
        EstimatedDuration = estimatedDuration;
        TotalChunks = totalChunks;
        ModelName = modelName;
        AdditionalData = additionalData ?? new Dictionary<string, string>();
    }

    public DateTimeOffset StartTime { get; }
    public TimeSpan? EstimatedDuration { get; }
    public int? TotalChunks { get; }
    public string? ModelName { get; }
    public IReadOnlyDictionary<string, string> AdditionalData { get; }

    public static StreamingMetadata Create(
        DateTimeOffset? startTime = null,
        TimeSpan? estimatedDuration = null,
        int? totalChunks = null,
        string? modelName = null,
        Dictionary<string, string>? additionalData = null
    )
    {
        return new StreamingMetadata(
            startTime ?? DateTimeOffset.UtcNow,
            estimatedDuration,
            totalChunks,
            modelName?.Trim(),
            additionalData
        );
    }

    public static StreamingMetadata Default() => Create();

    public bool Equals(StreamingMetadata? other) =>
        other is not null
        && StartTime == other.StartTime
        && EstimatedDuration == other.EstimatedDuration
        && TotalChunks == other.TotalChunks
        && ModelName == other.ModelName
        && AdditionalData.SequenceEqual(other.AdditionalData);

    public override bool Equals(object? obj) => Equals(obj as StreamingMetadata);

    public override int GetHashCode() =>
        HashCode.Combine(StartTime, EstimatedDuration, TotalChunks, ModelName, AdditionalData);

    public override string ToString() =>
        $"Started: {StartTime:HH:mm:ss}, Chunks: {TotalChunks ?? 0}";
}

/// <summary>
/// Entity representing a message that is being streamed in real-time.
/// This manages the streaming lifecycle and ensures proper delivery of content chunks.
/// </summary>
public sealed class StreamingMessage
{
    private readonly List<StreamingChunk> _chunks = [];

    private StreamingMessage() { }

    public StreamingMessageId Id { get; private set; }
    public MessageId MessageId { get; private set; }
    public ConversationId ConversationId { get; private set; }
    public StreamingStatus Status { get; private set; } = null!;
    public StreamingMetadata Metadata { get; private set; } = null!;
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? StartedAt { get; private set; }
    public DateTimeOffset? CompletedAt { get; private set; }
    public string? ErrorMessage { get; private set; }
    public int ChunkCount { get; private set; }
    public int TotalContentLength { get; private set; }

    public IReadOnlyList<StreamingChunk> Chunks => _chunks.AsReadOnly();

    internal StreamingMessage(
        MessageId messageId,
        ConversationId conversationId,
        StreamingMetadata metadata
    )
    {
        Id = StreamingMessageId.From(Guid.CreateVersion7());
        MessageId = messageId;
        ConversationId = conversationId;
        Status = StreamingStatus.Pending();
        Metadata = metadata;
        CreatedAt = DateTimeOffset.UtcNow;
        ChunkCount = 0;
        TotalContentLength = 0;
    }

    public static StreamingMessage Create(
        MessageId messageId,
        ConversationId conversationId,
        StreamingMetadata? metadata = null
    )
    {
        ThrowIfNull(messageId, nameof(messageId));
        ThrowIfNull(conversationId, nameof(conversationId));

        return new StreamingMessage(
            messageId,
            conversationId,
            metadata ?? StreamingMetadata.Default()
        );
    }

    public void StartStreaming()
    {
        if (!Status.IsPending)
            throw new InvalidOperationException(
                $"Cannot start streaming message in {Status} status"
            );

        Status = StreamingStatus.Streaming();
        StartedAt = DateTimeOffset.UtcNow;
    }

    public void AddChunk(StreamingChunk chunk)
    {
        ThrowIfNull(chunk, nameof(chunk));

        if (!Status.IsStreaming)
            throw new InvalidOperationException($"Cannot add chunks to message in {Status} status");

        _chunks.Add(chunk);
        ChunkCount = _chunks.Count;
        TotalContentLength += chunk.Content.Length;
    }

    public void CompleteStreaming()
    {
        if (!Status.IsStreaming)
            throw new InvalidOperationException(
                $"Cannot complete streaming message in {Status} status"
            );

        Status = StreamingStatus.Completed();
        CompletedAt = DateTimeOffset.UtcNow;
    }

    public void FailStreaming(string errorMessage)
    {
        ThrowIfNullOrWhiteSpace(errorMessage, nameof(errorMessage));

        if (!Status.IsActive)
            throw new InvalidOperationException(
                $"Cannot fail streaming message in {Status} status"
            );

        Status = StreamingStatus.Failed();
        ErrorMessage = errorMessage.Trim();
        CompletedAt = DateTimeOffset.UtcNow;
    }

    public void CancelStreaming()
    {
        if (!Status.IsActive)
            throw new InvalidOperationException(
                $"Cannot cancel streaming message in {Status} status"
            );

        Status = StreamingStatus.Cancelled();
        CompletedAt = DateTimeOffset.UtcNow;
    }

    public string GetFullContent()
    {
        return string.Join("", _chunks.OrderBy(c => c.SequenceNumber).Select(c => c.Content));
    }

    public TimeSpan? GetStreamingDuration()
    {
        if (!StartedAt.HasValue)
            return null;

        var endTime = CompletedAt ?? DateTimeOffset.UtcNow;
        return endTime - StartedAt.Value;
    }

    public double GetStreamingRate()
    {
        var duration = GetStreamingDuration();
        if (!duration.HasValue || duration.Value.TotalSeconds == 0)
            return 0;

        return TotalContentLength / duration.Value.TotalSeconds;
    }

    public bool IsStreamingComplete => Status.IsCompleted || Status.IsFailed || Status.IsCancelled;
    public bool IsCurrentlyStreaming => Status.IsStreaming;
    public bool HasError => Status.IsFailed && !string.IsNullOrEmpty(ErrorMessage);
}

[ValueObject<Guid>]
public readonly partial struct StreamingMessageId;
