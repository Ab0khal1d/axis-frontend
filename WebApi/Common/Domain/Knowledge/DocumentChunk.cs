using LinkawyGenie.Common.Domain.Base.Interfaces;

namespace LinkawyGenie.Common.Domain.Knowledge;

/// <summary>
/// Value object representing a vector embedding for semantic search.
/// This encapsulates the mathematical representation of text for similarity matching.
/// </summary>
public sealed class VectorEmbedding : IValueObject
{
    public const int MinDimensions = 128;
    public const int MaxDimensions = 4096;

    private VectorEmbedding(float[] values)
    {
        Values = values;
    }

    public float[] Values { get; }
    public int Dimensions => Values.Length;

    public static VectorEmbedding Create(float[] values)
    {
        ThrowIfNull(values, nameof(values));
        ThrowIfLessThan(values.Length, MinDimensions, nameof(values));
        ThrowIfGreaterThan(values.Length, MaxDimensions, nameof(values));

        // Create a copy to ensure immutability
        var copy = new float[values.Length];
        Array.Copy(values, copy, values.Length);

        return new VectorEmbedding(copy);
    }

    public float CosineSimilarity(VectorEmbedding other)
    {
        ThrowIfNull(other, nameof(other));

        if (Dimensions != other.Dimensions)
            throw new ArgumentException("Vector dimensions must match for similarity calculation");

        var dotProduct = 0.0f;
        var normA = 0.0f;
        var normB = 0.0f;

        for (var i = 0; i < Dimensions; i++)
        {
            dotProduct += Values[i] * other.Values[i];
            normA += Values[i] * Values[i];
            normB += other.Values[i] * other.Values[i];
        }

        if (normA == 0.0f || normB == 0.0f)
            return 0.0f;

        return dotProduct / (float)(Math.Sqrt(normA) * Math.Sqrt(normB));
    }

    public bool Equals(VectorEmbedding? other) =>
        other is not null && Dimensions == other.Dimensions && Values.SequenceEqual(other.Values);

    public override bool Equals(object? obj) => Equals(obj as VectorEmbedding);

    public override int GetHashCode() => HashCode.Combine(Dimensions, Values);

    public override string ToString() => $"VectorEmbedding({Dimensions} dimensions)";
}

/// <summary>
/// Value object representing metadata for a document chunk.
/// This provides context about the chunk's position and characteristics within the document.
/// </summary>
public sealed class ChunkMetadata : IValueObject
{
    public const int MaxSourceInfoLength = 500;

    private ChunkMetadata(int pageNumber, int chunkIndex, string? sourceInfo)
    {
        PageNumber = pageNumber;
        ChunkIndex = chunkIndex;
        SourceInfo = sourceInfo;
    }

    public int PageNumber { get; }
    public int ChunkIndex { get; }
    public string? SourceInfo { get; }

    public static ChunkMetadata Create(int pageNumber, int chunkIndex, string? sourceInfo = null)
    {
        ThrowIfLessThan(pageNumber, 1, nameof(pageNumber));
        ThrowIfLessThan(chunkIndex, 0, nameof(chunkIndex));

        if (!string.IsNullOrWhiteSpace(sourceInfo))
        {
            var trimmed = sourceInfo.Trim();
            ThrowIfGreaterThan(trimmed.Length, MaxSourceInfoLength, nameof(sourceInfo));
            sourceInfo = trimmed;
        }

        return new ChunkMetadata(pageNumber, chunkIndex, sourceInfo);
    }

    public bool Equals(ChunkMetadata? other) =>
        other is not null
        && PageNumber == other.PageNumber
        && ChunkIndex == other.ChunkIndex
        && SourceInfo == other.SourceInfo;

    public override bool Equals(object? obj) => Equals(obj as ChunkMetadata);

    public override int GetHashCode() => HashCode.Combine(PageNumber, ChunkIndex, SourceInfo);

    public override string ToString() => $"Page {PageNumber}, Chunk {ChunkIndex}";
}

/// <summary>
/// Entity representing a chunk of text extracted from a document.
/// Chunks are the atomic units used for semantic search and retrieval.
/// This entity maintains the relationship between text content and its vector representation.
/// </summary>
public sealed class DocumentChunk
{
    public const int MinContentLength = 10;
    public const int MaxContentLength = 2000;

    private DocumentChunk() { }

    public DocumentChunkId Id { get; private set; }
    public DocumentId DocumentId { get; private set; }
    public string Content { get; private set; } = null!;
    public VectorEmbedding? Embedding { get; private set; }
    public ChunkMetadata Metadata { get; private set; } = null!;
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? ProcessedAt { get; private set; }

    internal DocumentChunk(
        DocumentId documentId,
        string content,
        ChunkMetadata metadata,
        DateTimeOffset createdAt
    )
    {
        Id = DocumentChunkId.From(Guid.CreateVersion7());
        DocumentId = documentId;
        Content = content;
        Metadata = metadata;
        CreatedAt = createdAt;
    }

    public static DocumentChunk Create(
        DocumentId documentId,
        string content,
        ChunkMetadata metadata
    )
    {
        ThrowIfNull(documentId, nameof(documentId));
        ThrowIfNullOrWhiteSpace(content, nameof(content));
        ThrowIfNull(metadata, nameof(metadata));

        var trimmedContent = content.Trim();
        ThrowIfLessThan(trimmedContent.Length, MinContentLength, nameof(content));
        ThrowIfGreaterThan(trimmedContent.Length, MaxContentLength, nameof(content));

        return new DocumentChunk(documentId, trimmedContent, metadata, DateTimeOffset.UtcNow);
    }

    public void SetEmbedding(VectorEmbedding embedding)
    {
        ThrowIfNull(embedding, nameof(embedding));

        Embedding = embedding;
        ProcessedAt = DateTimeOffset.UtcNow;
    }

    public bool HasEmbedding => Embedding is not null;
    public bool IsProcessed => ProcessedAt.HasValue;

    public float CalculateSimilarity(VectorEmbedding queryEmbedding)
    {
        if (Embedding is null)
            throw new InvalidOperationException("Cannot calculate similarity without embedding");

        return Embedding.CosineSimilarity(queryEmbedding);
    }

    public void UpdateContent(string newContent)
    {
        ThrowIfNullOrWhiteSpace(newContent, nameof(newContent));

        var trimmedContent = newContent.Trim();
        ThrowIfLessThan(trimmedContent.Length, MinContentLength, nameof(newContent));
        ThrowIfGreaterThan(trimmedContent.Length, MaxContentLength, nameof(newContent));

        Content = trimmedContent;
        // Reset embedding when content changes
        Embedding = null;
        ProcessedAt = null;
    }
}

[ValueObject<Guid>]
public readonly partial struct DocumentChunkId;
