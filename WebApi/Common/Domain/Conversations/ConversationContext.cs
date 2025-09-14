//using LinkawyGenie.Common.Domain.Base.Interfaces;
//using LinkawyGenie.Common.Domain.Knowledge;

//namespace LinkawyGenie.Common.Domain.Conversations;

///// <summary>
///// Value object representing the context type for a conversation.
///// This determines how the conversation context is managed and retrieved.
///// </summary>
//public sealed class ContextType : IValueObject
//{
//    private ContextType(string value)
//    {
//        Value = value;
//    }

//    public string Value { get; }

//    public static ContextType Create(string value)
//    {
//        ThrowIfNullOrWhiteSpace(value, nameof(value));
//        var trimmed = value.Trim().ToLowerInvariant();

//        return trimmed switch
//        {
//            "memory" => new ContextType("memory"),
//            "knowledge" => new ContextType("knowledge"),
//            "hybrid" => new ContextType("hybrid"),
//            "none" => new ContextType("none"),
//            _ => throw new ArgumentException($"Invalid context type: {value}", nameof(value)),
//        };
//    }

//    public static ContextType Memory() => new("memory");

//    public static ContextType Knowledge() => new("knowledge");

//    public static ContextType Hybrid() => new("hybrid");

//    public static ContextType None() => new("none");

//    public bool UsesMemory => Value == "memory" || Value == "hybrid";
//    public bool UsesKnowledge => Value == "knowledge" || Value == "hybrid";
//    public bool IsNone => Value == "none";

//    public bool Equals(ContextType? other) =>
//        other is not null && Value.Equals(other.Value, StringComparison.OrdinalIgnoreCase);

//    public override bool Equals(object? obj) => Equals(obj as ContextType);

//    public override int GetHashCode() => Value.GetHashCode(StringComparison.OrdinalIgnoreCase);

//    public override string ToString() => Value;
//}

///// <summary>
///// Value object representing conversation settings and configuration.
///// This encapsulates user preferences and system behavior for conversations.
///// </summary>
//public sealed class ConversationSettings : IValueObject
//{
//    public const int MinContextWindow = 1;
//    public const int MaxContextWindow = 50;
//    public const int MinTemperature = 0;
//    public const int MaxTemperature = 2;

//    private ConversationSettings(
//        ContextType contextType,
//        int contextWindow,
//        float temperature,
//        bool enableStreaming,
//        bool enableAutoTitling,
//        KnowledgeBaseId? knowledgeBaseId
//    )
//    {
//        ContextType = contextType;
//        ContextWindow = contextWindow;
//        Temperature = temperature;
//        EnableStreaming = enableStreaming;
//        EnableAutoTitling = enableAutoTitling;
//        KnowledgeBaseId = knowledgeBaseId;
//    }

//    public ContextType ContextType { get; }
//    public int ContextWindow { get; }
//    public float Temperature { get; }
//    public bool EnableStreaming { get; }
//    public bool EnableAutoTitling { get; }
//    public KnowledgeBaseId? KnowledgeBaseId { get; }

//    public static ConversationSettings Create(
//        ContextType? contextType = null,
//        int contextWindow = 10,
//        float temperature = 0.7f,
//        bool enableStreaming = true,
//        bool enableAutoTitling = true,
//        KnowledgeBaseId? knowledgeBaseId = null
//    )
//    {
//        ThrowIfLessThan(contextWindow, MinContextWindow, nameof(contextWindow));
//        ThrowIfGreaterThan(contextWindow, MaxContextWindow, nameof(contextWindow));
//        ThrowIfLessThan(temperature, MinTemperature, nameof(temperature));
//        ThrowIfGreaterThan(temperature, MaxTemperature, nameof(temperature));

//        return new ConversationSettings(
//            contextType ?? ContextType.Memory(),
//            contextWindow,
//            temperature,
//            enableStreaming,
//            enableAutoTitling,
//            knowledgeBaseId
//        );
//    }

//    public static ConversationSettings Default() => Create();

//    public bool Equals(ConversationSettings? other) =>
//        other is not null
//        && ContextType.Equals(other.ContextType)
//        && ContextWindow == other.ContextWindow
//        && Math.Abs(Temperature - other.Temperature) < 0.001f
//        && EnableStreaming == other.EnableStreaming
//        && EnableAutoTitling == other.EnableAutoTitling
//        && KnowledgeBaseId == other.KnowledgeBaseId;

//    public override bool Equals(object? obj) => Equals(obj as ConversationSettings);

//    public override int GetHashCode() =>
//        HashCode.Combine(
//            ContextType,
//            ContextWindow,
//            Temperature,
//            EnableStreaming,
//            EnableAutoTitling,
//            KnowledgeBaseId
//        );

//    public override string ToString() =>
//        $"Context: {ContextType}, Window: {ContextWindow}, Temp: {Temperature:F1}";
//}

///// <summary>
///// Value object representing streaming configuration for real-time responses.
///// This controls how AI responses are streamed to the user interface.
///// </summary>
//public sealed class StreamingConfiguration : IValueObject
//{
//    public const int MinChunkSize = 1;
//    public const int MaxChunkSize = 1000;
//    public const int MinDelayMs = 0;
//    public const int MaxDelayMs = 5000;

//    private StreamingConfiguration(bool enabled, int chunkSize, int delayMs, bool includeMetadata)
//    {
//        Enabled = enabled;
//        ChunkSize = chunkSize;
//        DelayMs = delayMs;
//        IncludeMetadata = includeMetadata;
//    }

//    public bool Enabled { get; }
//    public int ChunkSize { get; }
//    public int DelayMs { get; }
//    public bool IncludeMetadata { get; }

//    public static StreamingConfiguration Create(
//        bool enabled = true,
//        int chunkSize = 50,
//        int delayMs = 100,
//        bool includeMetadata = true
//    )
//    {
//        ThrowIfLessThan(chunkSize, MinChunkSize, nameof(chunkSize));
//        ThrowIfGreaterThan(chunkSize, MaxChunkSize, nameof(chunkSize));
//        ThrowIfLessThan(delayMs, MinDelayMs, nameof(delayMs));
//        ThrowIfGreaterThan(delayMs, MaxDelayMs, nameof(delayMs));

//        return new StreamingConfiguration(enabled, chunkSize, delayMs, includeMetadata);
//    }

//    public static StreamingConfiguration Default() => Create();

//    public static StreamingConfiguration Disabled() => Create(enabled: false);

//    public bool Equals(StreamingConfiguration? other) =>
//        other is not null
//        && Enabled == other.Enabled
//        && ChunkSize == other.ChunkSize
//        && DelayMs == other.DelayMs
//        && IncludeMetadata == other.IncludeMetadata;

//    public override bool Equals(object? obj) => Equals(obj as StreamingConfiguration);

//    public override int GetHashCode() =>
//        HashCode.Combine(Enabled, ChunkSize, DelayMs, IncludeMetadata);

//    public override string ToString() =>
//        $"Enabled: {Enabled}, ChunkSize: {ChunkSize}, Delay: {DelayMs}ms";
//}

///// <summary>
///// Entity representing the context and state of a conversation.
///// This manages conversation memory, settings, and streaming configuration.
///// It ensures that conversation context is maintained consistently across sessions.
///// </summary>
//public sealed class ConversationContext
//{
//    private readonly List<Message> _contextMessages = [];
//    private readonly List<SearchQueryId> _relatedQueries = [];

//    private ConversationContext() { }

//    public ConversationContextId Id { get; private set; }
//    public ConversationId ConversationId { get; private set; }
//    public MessageId LastMessageId { get; private set; }
//    public string ContextData { get; private set; } = null!; // JSON array of message context
//    public DateTimeOffset CreatedAt { get; private set; }
//    public DateTimeOffset UpdatedAt { get; private set; }
//    public DateTimeOffset ExpiresAt { get; private set; }

//    // Additional domain properties not in DB schema
//    public ConversationSettings Settings { get; private set; } = null!;
//    public StreamingConfiguration StreamingConfig { get; private set; } = null!;
//    public int ContextMessageCount { get; private set; }
//    public bool IsActive { get; private set; }

//    public IReadOnlyList<Message> ContextMessages => _contextMessages.AsReadOnly();
//    public IReadOnlyList<SearchQueryId> RelatedQueries => _relatedQueries.AsReadOnly();

//    internal ConversationContext(
//        ConversationId conversationId,
//        MessageId lastMessageId,
//        string contextData,
//        ConversationSettings settings,
//        StreamingConfiguration streamingConfig,
//        DateTimeOffset expiresAt
//    )
//    {
//        Id = ConversationContextId.From(Guid.CreateVersion7());
//        ConversationId = conversationId;
//        LastMessageId = lastMessageId;
//        ContextData = contextData;
//        Settings = settings;
//        StreamingConfig = streamingConfig;
//        CreatedAt = DateTimeOffset.UtcNow;
//        UpdatedAt = DateTimeOffset.UtcNow;
//        ExpiresAt = expiresAt;
//        ContextMessageCount = 0;
//        IsActive = true;
//    }

//    public static ConversationContext Create(
//        ConversationId conversationId,
//        MessageId lastMessageId,
//        string contextData,
//        ConversationSettings? settings = null,
//        StreamingConfiguration? streamingConfig = null,
//        DateTimeOffset? expiresAt = null
//    )
//    {
//        ThrowIfNull(conversationId, nameof(conversationId));
//        ThrowIfNull(lastMessageId, nameof(lastMessageId));
//        ThrowIfNullOrWhiteSpace(contextData, nameof(contextData));

//        // Default expiration time is 24 hours from now
//        var expiration = expiresAt ?? DateTimeOffset.UtcNow.AddHours(24);

//        return new ConversationContext(
//            conversationId,
//            lastMessageId,
//            contextData,
//            settings ?? ConversationSettings.Default(),
//            streamingConfig ?? StreamingConfiguration.Default(),
//            expiration
//        );
//    }

//    public void AddContextMessage(Message message)
//    {
//        ThrowIfNull(message, nameof(message));

//        if (message.ConversationId != ConversationId)
//            throw new ArgumentException(
//                "Message does not belong to this conversation",
//                nameof(message)
//            );

//        _contextMessages.Add(message);
//        ContextMessageCount = _contextMessages.Count;
//        LastMessageId = message.Id;
//        UpdatedAt = DateTimeOffset.UtcNow;

//        // Update ContextData - serialize the context messages
//        UpdateContextData();

//        // Maintain context window size
//        if (_contextMessages.Count > Settings.ContextWindow)
//        {
//            _contextMessages.RemoveAt(0);
//            ContextMessageCount = _contextMessages.Count;
//        }
//    }

//    public void AddRelatedQuery(SearchQueryId queryId)
//    {
//        ThrowIfNull(queryId, nameof(queryId));

//        if (!_relatedQueries.Contains(queryId))
//        {
//            _relatedQueries.Add(queryId);
//            UpdatedAt = DateTimeOffset.UtcNow;
//        }
//    }

//    private void UpdateContextData()
//    {
//        // This would typically serialize _contextMessages to JSON
//        // For simplicity we're just storing the count and timestamps for now
//        ContextData = System.Text.Json.JsonSerializer.Serialize(
//            new
//            {
//                MessageCount = _contextMessages.Count,
//                LastUpdated = DateTimeOffset.UtcNow,
//                MessageIds = _contextMessages.Select(m => m.Id.Value).ToArray(),
//            }
//        );
//    }

//    public void UpdateSettings(ConversationSettings newSettings)
//    {
//        ThrowIfNull(newSettings, nameof(newSettings));

//        Settings = newSettings;
//        UpdatedAt = DateTimeOffset.UtcNow;

//        // Adjust context window if needed
//        if (_contextMessages.Count > Settings.ContextWindow)
//        {
//            var excess = _contextMessages.Count - Settings.ContextWindow;
//            _contextMessages.RemoveRange(0, excess);
//            ContextMessageCount = _contextMessages.Count;

//            // Update serialized context data
//            UpdateContextData();
//        }
//    }

//    public void UpdateStreamingConfiguration(StreamingConfiguration newConfig)
//    {
//        ThrowIfNull(newConfig, nameof(newConfig));

//        StreamingConfig = newConfig;
//        UpdatedAt = DateTimeOffset.UtcNow;
//    }

//    public void ClearContext()
//    {
//        _contextMessages.Clear();
//        _relatedQueries.Clear();
//        ContextMessageCount = 0;
//        UpdatedAt = DateTimeOffset.UtcNow;

//        // Update serialized context data
//        UpdateContextData();
//    }

//    public void Deactivate()
//    {
//        IsActive = false;
//        UpdatedAt = DateTimeOffset.UtcNow;
//    }

//    public void Activate()
//    {
//        IsActive = true;
//        UpdatedAt = DateTimeOffset.UtcNow;
//    }

//    public void ExtendExpiration(TimeSpan duration)
//    {
//        ExpiresAt = DateTimeOffset.UtcNow.Add(duration);
//        UpdatedAt = DateTimeOffset.UtcNow;
//    }

//    public IEnumerable<Message> GetRecentMessages(int count)
//    {
//        return _contextMessages.TakeLast(count);
//    }

//    public bool HasKnowledgeBase => Settings.KnowledgeBaseId.HasValue;
//    public bool UsesStreaming => StreamingConfig.Enabled;
//    public bool IsContextFull => _contextMessages.Count >= Settings.ContextWindow;
//}

//[ValueObject<Guid>]
//public readonly partial struct ConversationContextId;
