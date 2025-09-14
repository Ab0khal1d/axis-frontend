using LinkawyGenie.Common.Domain.Base;
using LinkawyGenie.Common.Domain.Base.Interfaces;
using LinkawyGenie.Common.Domain.Users;

namespace LinkawyGenie.Common.Domain.Knowledge;

/// <summary>
/// Value object representing the status of the knowledge base.
/// This tracks the overall health and availability of the knowledge system.
/// </summary>
public sealed class KnowledgeBaseStatus : IValueObject
{
    private KnowledgeBaseStatus(string value)
    {
        Value = value;
    }

    public string Value { get; }

    public static KnowledgeBaseStatus Create(string value)
    {
        ThrowIfNullOrWhiteSpace(value, nameof(value));
        var trimmed = value.Trim().ToLowerInvariant();

        return trimmed switch
        {
            "active" => new KnowledgeBaseStatus("active"),
            "maintenance" => new KnowledgeBaseStatus("maintenance"),
            "disabled" => new KnowledgeBaseStatus("disabled"),
            "error" => new KnowledgeBaseStatus("error"),
            _ => throw new ArgumentException(
                $"Invalid knowledge base status: {value}",
                nameof(value)
            ),
        };
    }

    public static KnowledgeBaseStatus Active() => new("active");

    public static KnowledgeBaseStatus Maintenance() => new("maintenance");

    public static KnowledgeBaseStatus Disabled() => new("disabled");

    public static KnowledgeBaseStatus Error() => new("error");

    public bool IsActive => Value == "active";
    public bool IsMaintenance => Value == "maintenance";
    public bool IsDisabled => Value == "disabled";
    public bool IsError => Value == "error";

    public bool Equals(KnowledgeBaseStatus? other) =>
        other is not null && Value.Equals(other.Value, StringComparison.OrdinalIgnoreCase);

    public override bool Equals(object? obj) => Equals(obj as KnowledgeBaseStatus);

    public override int GetHashCode() => Value.GetHashCode(StringComparison.OrdinalIgnoreCase);

    public override string ToString() => Value;
}

/// <summary>
/// Value object representing search configuration for the knowledge base.
/// This encapsulates search parameters and behavior settings.
/// </summary>
public sealed class SearchConfiguration : IValueObject
{
    public const int MinTopK = 1;
    public const int MaxTopK = 100;
    public const float MinSimilarityThreshold = 0.0f;
    public const float MaxSimilarityThreshold = 1.0f;

    private SearchConfiguration(int topK, float similarityThreshold, bool includeMetadata)
    {
        TopK = topK;
        SimilarityThreshold = similarityThreshold;
        IncludeMetadata = includeMetadata;
    }

    public int TopK { get; }
    public float SimilarityThreshold { get; }
    public bool IncludeMetadata { get; }

    public static SearchConfiguration Create(
        int topK = 5,
        float similarityThreshold = 0.7f,
        bool includeMetadata = true
    )
    {
        ThrowIfLessThan(topK, MinTopK, nameof(topK));
        ThrowIfGreaterThan(topK, MaxTopK, nameof(topK));
        ThrowIfLessThan(similarityThreshold, MinSimilarityThreshold, nameof(similarityThreshold));
        ThrowIfGreaterThan(
            similarityThreshold,
            MaxSimilarityThreshold,
            nameof(similarityThreshold)
        );

        return new SearchConfiguration(topK, similarityThreshold, includeMetadata);
    }

    public static SearchConfiguration Default() => Create();

    public bool Equals(SearchConfiguration? other) =>
        other is not null
        && TopK == other.TopK
        && Math.Abs(SimilarityThreshold - other.SimilarityThreshold) < 0.001f
        && IncludeMetadata == other.IncludeMetadata;

    public override bool Equals(object? obj) => Equals(obj as SearchConfiguration);

    public override int GetHashCode() =>
        HashCode.Combine(TopK, SimilarityThreshold, IncludeMetadata);

    public override string ToString() =>
        $"TopK: {TopK}, Threshold: {SimilarityThreshold:F2}, IncludeMetadata: {IncludeMetadata}";
}

/// <summary>
/// Aggregate root representing the knowledge base system.
/// This aggregate manages the collection of documents and provides search capabilities.
/// It ensures that knowledge base operations are consistent and follow business rules.
/// </summary>
public sealed class KnowledgeBase : AggregateRoot<KnowledgeBaseId>
{
    private readonly List<Document> _documents = [];
    private readonly List<SearchQuery> _searchHistory = [];

    private KnowledgeBase() { }

    public string Name { get; private set; } = null!;
    public string Description { get; private set; } = null!;
    public KnowledgeBaseStatus Status { get; private set; } = null!;
    public SearchConfiguration SearchConfig { get; private set; } = null!;
    public UserId CreatedBy { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? LastUpdatedAt { get; private set; }
    public int TotalDocuments { get; private set; }
    public int TotalChunks { get; private set; }
    public long TotalStorageBytes { get; private set; }

    public IReadOnlyList<Document> Documents => _documents.AsReadOnly();
    public IReadOnlyList<SearchQuery> SearchHistory => _searchHistory.AsReadOnly();

    public static KnowledgeBase Create(
        string name,
        string description,
        UserId createdBy,
        SearchConfiguration? searchConfig = null
    )
    {
        ThrowIfNullOrWhiteSpace(name, nameof(name));
        ThrowIfNullOrWhiteSpace(description, nameof(description));
        ThrowIfNull(createdBy, nameof(createdBy));

        var knowledgeBase = new KnowledgeBase
        {
            Id = KnowledgeBaseId.From(Guid.CreateVersion7()),
            Name = name.Trim(),
            Description = description.Trim(),
            Status = KnowledgeBaseStatus.Active(),
            SearchConfig = searchConfig ?? SearchConfiguration.Default(),
            CreatedBy = createdBy,
            CreatedAt = DateTimeOffset.UtcNow,
            TotalDocuments = 0,
            TotalChunks = 0,
            TotalStorageBytes = 0,
        };

        knowledgeBase.AddDomainEvent(new KnowledgeBaseCreatedEvent(knowledgeBase));
        return knowledgeBase;
    }

    public void AddDocument(Document document)
    {
        ThrowIfNull(document, nameof(document));

        if (!Status.IsActive)
            throw new InvalidOperationException(
                $"Cannot add documents to knowledge base in {Status} status"
            );

        if (_documents.Any(d => d.Id == document.Id))
            return; // Document already exists

        _documents.Add(document);
        TotalDocuments = _documents.Count;
        TotalStorageBytes += document.FileMetadata.FileSizeBytes;

        AddDomainEvent(new DocumentAddedToKnowledgeBaseEvent(this, document));
    }

    public void RemoveDocument(DocumentId documentId)
    {
        var document = _documents.FirstOrDefault(d => d.Id == documentId);
        if (document is null)
            return;

        if (!Status.IsActive)
            throw new InvalidOperationException(
                $"Cannot remove documents from knowledge base in {Status} status"
            );

        _documents.Remove(document);
        TotalDocuments = _documents.Count;
        TotalStorageBytes -= document.FileMetadata.FileSizeBytes;

        AddDomainEvent(new DocumentRemovedFromKnowledgeBaseEvent(this, document));
    }

    public void UpdateSearchConfiguration(SearchConfiguration newConfig)
    {
        ThrowIfNull(newConfig, nameof(newConfig));

        SearchConfig = newConfig;
        LastUpdatedAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new KnowledgeBaseSearchConfigUpdatedEvent(this));
    }

    public void UpdateStatus(KnowledgeBaseStatus newStatus)
    {
        ThrowIfNull(newStatus, nameof(newStatus));

        var oldStatus = Status;
        Status = newStatus;
        LastUpdatedAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new KnowledgeBaseStatusChangedEvent(this, oldStatus, newStatus));
    }

    public void UpdateName(string newName)
    {
        ThrowIfNullOrWhiteSpace(newName, nameof(newName));

        Name = newName.Trim();
        LastUpdatedAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new KnowledgeBaseNameUpdatedEvent(this));
    }

    public void UpdateDescription(string newDescription)
    {
        ThrowIfNullOrWhiteSpace(newDescription, nameof(newDescription));

        Description = newDescription.Trim();
        LastUpdatedAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new KnowledgeBaseDescriptionUpdatedEvent(this));
    }

    public void RecordSearch(SearchQuery searchQuery)
    {
        ThrowIfNull(searchQuery, nameof(searchQuery));

        _searchHistory.Add(searchQuery);

        // Keep only last 1000 searches to prevent unbounded growth
        if (_searchHistory.Count > 1000)
        {
            _searchHistory.RemoveAt(0);
        }

        AddDomainEvent(new KnowledgeBaseSearchRecordedEvent(this, searchQuery));
    }

    public void UpdateChunkCount(int newChunkCount)
    {
        ThrowIfLessThan(newChunkCount, 0, nameof(newChunkCount));

        TotalChunks = newChunkCount;
        LastUpdatedAt = DateTimeOffset.UtcNow;
    }

    public IEnumerable<Document> GetProcessedDocuments()
    {
        return _documents.Where(d => d.IsProcessed);
    }

    public IEnumerable<Document> GetProcessingDocuments()
    {
        return _documents.Where(d => d.IsProcessing);
    }

    public IEnumerable<Document> GetFailedDocuments()
    {
        return _documents.Where(d => d.IsFailed);
    }

    public bool HasDocument(DocumentId documentId)
    {
        return _documents.Any(d => d.Id == documentId);
    }

    public Document? GetDocument(DocumentId documentId)
    {
        return _documents.FirstOrDefault(d => d.Id == documentId);
    }

    public bool CanAcceptNewDocuments => Status.IsActive;
    public bool IsOperational => Status.IsActive;
}

[ValueObject<Guid>]
public readonly partial struct KnowledgeBaseId;

// Domain Events
public sealed record KnowledgeBaseCreatedEvent(KnowledgeBase KnowledgeBase) : IDomainEvent;

public sealed record DocumentAddedToKnowledgeBaseEvent(
    KnowledgeBase KnowledgeBase,
    Document Document
) : IDomainEvent;

public sealed record DocumentRemovedFromKnowledgeBaseEvent(
    KnowledgeBase KnowledgeBase,
    Document Document
) : IDomainEvent;

public sealed record KnowledgeBaseSearchConfigUpdatedEvent(KnowledgeBase KnowledgeBase)
    : IDomainEvent;

public sealed record KnowledgeBaseStatusChangedEvent(
    KnowledgeBase KnowledgeBase,
    KnowledgeBaseStatus OldStatus,
    KnowledgeBaseStatus NewStatus
) : IDomainEvent;

public sealed record KnowledgeBaseNameUpdatedEvent(KnowledgeBase KnowledgeBase) : IDomainEvent;

public sealed record KnowledgeBaseDescriptionUpdatedEvent(KnowledgeBase KnowledgeBase)
    : IDomainEvent;

public sealed record KnowledgeBaseSearchRecordedEvent(
    KnowledgeBase KnowledgeBase,
    SearchQuery SearchQuery
) : IDomainEvent;
