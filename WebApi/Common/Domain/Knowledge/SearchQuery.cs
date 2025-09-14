using LinkawyGenie.Common.Domain.Base.Interfaces;
using LinkawyGenie.Common.Domain.Users;

namespace LinkawyGenie.Common.Domain.Knowledge;

/// <summary>
/// Value object representing the type of search query.
/// This helps categorize and optimize different types of searches.
/// </summary>
public sealed class SearchQueryType : IValueObject
{
    private SearchQueryType(string value)
    {
        Value = value;
    }

    public string Value { get; }

    public static SearchQueryType Create(string value)
    {
        ThrowIfNullOrWhiteSpace(value, nameof(value));
        var trimmed = value.Trim().ToLowerInvariant();

        return trimmed switch
        {
            "semantic" => new SearchQueryType("semantic"),
            "keyword" => new SearchQueryType("keyword"),
            "hybrid" => new SearchQueryType("hybrid"),
            "similarity" => new SearchQueryType("similarity"),
            _ => throw new ArgumentException($"Invalid search query type: {value}", nameof(value)),
        };
    }

    public static SearchQueryType Semantic() => new("semantic");

    public static SearchQueryType Keyword() => new("keyword");

    public static SearchQueryType Hybrid() => new("hybrid");

    public static SearchQueryType Similarity() => new("similarity");

    public bool Equals(SearchQueryType? other) =>
        other is not null && Value.Equals(other.Value, StringComparison.OrdinalIgnoreCase);

    public override bool Equals(object? obj) => Equals(obj as SearchQueryType);

    public override int GetHashCode() => Value.GetHashCode(StringComparison.OrdinalIgnoreCase);

    public override string ToString() => Value;
}

/// <summary>
/// Value object representing search filters for query refinement.
/// This allows users to narrow down search results based on various criteria.
/// </summary>
public sealed class SearchFilters : IValueObject
{
    private SearchFilters(
        IReadOnlyList<DocumentId>? documentIds,
        IReadOnlyList<DocumentType>? documentTypes,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        IReadOnlyList<string>? tags
    )
    {
        DocumentIds = documentIds;
        DocumentTypes = documentTypes;
        FromDate = fromDate;
        ToDate = toDate;
        Tags = tags;
    }

    public IReadOnlyList<DocumentId>? DocumentIds { get; }
    public IReadOnlyList<DocumentType>? DocumentTypes { get; }
    public DateTimeOffset? FromDate { get; }
    public DateTimeOffset? ToDate { get; }
    public IReadOnlyList<string>? Tags { get; }

    public static SearchFilters Create(
        IReadOnlyList<DocumentId>? documentIds = null,
        IReadOnlyList<DocumentType>? documentTypes = null,
        DateTimeOffset? fromDate = null,
        DateTimeOffset? toDate = null,
        IReadOnlyList<string>? tags = null
    )
    {
        // Validate date range
        if (fromDate.HasValue && toDate.HasValue && fromDate.Value > toDate.Value)
            throw new ArgumentException("FromDate cannot be greater than ToDate");

        // Validate tags
        if (tags is not null)
        {
            var validTags = tags.Where(t => !string.IsNullOrWhiteSpace(t))
                .Select(t => t.Trim())
                .ToList();
            tags = validTags;
        }

        return new SearchFilters(documentIds, documentTypes, fromDate, toDate, tags);
    }

    public static SearchFilters Empty() => Create();

    public bool HasFilters =>
        DocumentIds?.Count > 0
        || DocumentTypes?.Count > 0
        || FromDate.HasValue
        || ToDate.HasValue
        || Tags?.Count > 0;

    public bool Equals(SearchFilters? other) =>
        other is not null
        && (DocumentIds?.SequenceEqual(other.DocumentIds ?? []) ?? other.DocumentIds is null)
        && (DocumentTypes?.SequenceEqual(other.DocumentTypes ?? []) ?? other.DocumentTypes is null)
        && FromDate == other.FromDate
        && ToDate == other.ToDate
        && (Tags?.SequenceEqual(other.Tags ?? []) ?? other.Tags is null);

    public override bool Equals(object? obj) => Equals(obj as SearchFilters);

    public override int GetHashCode() =>
        HashCode.Combine(DocumentIds, DocumentTypes, FromDate, ToDate, Tags);

    public override string ToString() =>
        $"Filters: {DocumentIds?.Count ?? 0} docs, {DocumentTypes?.Count ?? 0} types, {Tags?.Count ?? 0} tags";
}

/// <summary>
/// Value object representing search results with relevance scoring.
/// This encapsulates the result of a search operation with metadata.
/// </summary>
public sealed class SearchResult : IValueObject
{
    public const float MinRelevanceScore = 0.0f;
    public const float MaxRelevanceScore = 1.0f;

    private SearchResult(DocumentChunkId chunkId, float relevanceScore, string? highlight)
    {
        ChunkId = chunkId;
        RelevanceScore = relevanceScore;
        Highlight = highlight;
    }

    public DocumentChunkId ChunkId { get; }
    public float RelevanceScore { get; }
    public string? Highlight { get; }

    public static SearchResult Create(
        DocumentChunkId chunkId,
        float relevanceScore,
        string? highlight = null
    )
    {
        ThrowIfNull(chunkId, nameof(chunkId));
        ThrowIfLessThan(relevanceScore, MinRelevanceScore, nameof(relevanceScore));
        ThrowIfGreaterThan(relevanceScore, MaxRelevanceScore, nameof(relevanceScore));

        return new SearchResult(chunkId, relevanceScore, highlight?.Trim());
    }

    public bool Equals(SearchResult? other) =>
        other is not null
        && ChunkId.Equals(other.ChunkId)
        && Math.Abs(RelevanceScore - other.RelevanceScore) < 0.001f
        && Highlight == other.Highlight;

    public override bool Equals(object? obj) => Equals(obj as SearchResult);

    public override int GetHashCode() => HashCode.Combine(ChunkId, RelevanceScore, Highlight);

    public override string ToString() => $"Chunk: {ChunkId}, Score: {RelevanceScore:F3}";
}

/// <summary>
/// Entity representing a search query executed against the knowledge base.
/// This tracks search operations for analytics and optimization purposes.
/// </summary>
public sealed class SearchQuery
{
    public const int MinQueryLength = 1;
    public const int MaxQueryLength = 1000;

    private SearchQuery() { }

    public SearchQueryId Id { get; private set; }
    public UserId UserId { get; private set; }
    public KnowledgeBaseId KnowledgeBaseId { get; private set; }
    public string QueryText { get; private set; } = null!;
    public SearchQueryType QueryType { get; private set; } = null!;
    public SearchFilters Filters { get; private set; } = null!;
    public VectorEmbedding? QueryEmbedding { get; private set; }
    public DateTimeOffset ExecutedAt { get; private set; }
    public TimeSpan ExecutionTime { get; private set; }
    public int ResultCount { get; private set; }
    public IReadOnlyList<SearchResult> Results { get; private set; } = [];
    public string? ErrorMessage { get; private set; }
    public bool IsSuccessful { get; private set; }

    internal SearchQuery(
        UserId userId,
        KnowledgeBaseId knowledgeBaseId,
        string queryText,
        SearchQueryType queryType,
        SearchFilters filters,
        VectorEmbedding? queryEmbedding = null
    )
    {
        Id = SearchQueryId.From(Guid.CreateVersion7());
        UserId = userId;
        KnowledgeBaseId = knowledgeBaseId;
        QueryText = queryText;
        QueryType = queryType;
        Filters = filters;
        QueryEmbedding = queryEmbedding;
        ExecutedAt = DateTimeOffset.UtcNow;
        ExecutionTime = TimeSpan.Zero;
        ResultCount = 0;
        Results = [];
        IsSuccessful = false;
    }

    public static SearchQuery Create(
        UserId userId,
        KnowledgeBaseId knowledgeBaseId,
        string queryText,
        SearchQueryType queryType,
        SearchFilters? filters = null,
        VectorEmbedding? queryEmbedding = null
    )
    {
        ThrowIfNull(userId, nameof(userId));
        ThrowIfNull(knowledgeBaseId, nameof(knowledgeBaseId));
        ThrowIfNullOrWhiteSpace(queryText, nameof(queryText));
        ThrowIfNull(queryType, nameof(queryType));

        var trimmedQuery = queryText.Trim();
        ThrowIfLessThan(trimmedQuery.Length, MinQueryLength, nameof(queryText));
        ThrowIfGreaterThan(trimmedQuery.Length, MaxQueryLength, nameof(queryText));

        return new SearchQuery(
            userId,
            knowledgeBaseId,
            trimmedQuery,
            queryType,
            filters ?? SearchFilters.Empty(),
            queryEmbedding
        );
    }

    public void CompleteSearch(IReadOnlyList<SearchResult> results, TimeSpan executionTime)
    {
        ThrowIfNull(results, nameof(results));
        ThrowIfLessThan(executionTime, TimeSpan.Zero, nameof(executionTime));

        Results = results;
        ResultCount = results.Count;
        ExecutionTime = executionTime;
        IsSuccessful = true;
        ErrorMessage = null;
    }

    public void FailSearch(string errorMessage, TimeSpan executionTime)
    {
        ThrowIfNullOrWhiteSpace(errorMessage, nameof(errorMessage));
        ThrowIfLessThan(executionTime, TimeSpan.Zero, nameof(executionTime));

        Results = [];
        ResultCount = 0;
        ExecutionTime = executionTime;
        IsSuccessful = false;
        ErrorMessage = errorMessage.Trim();
    }

    public void SetQueryEmbedding(VectorEmbedding embedding)
    {
        ThrowIfNull(embedding, nameof(embedding));
        QueryEmbedding = embedding;
    }

    public bool HasEmbedding => QueryEmbedding is not null;
    public bool IsSemanticSearch =>
        QueryType == SearchQueryType.Semantic() || QueryType == SearchQueryType.Hybrid();
    public bool IsKeywordSearch =>
        QueryType == SearchQueryType.Keyword() || QueryType == SearchQueryType.Hybrid();
}

[ValueObject<Guid>]
public readonly partial struct SearchQueryId;
