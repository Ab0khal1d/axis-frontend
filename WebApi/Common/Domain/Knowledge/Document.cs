using LinkawyGenie.Common.Domain.Base;
using LinkawyGenie.Common.Domain.Base.Interfaces;
using LinkawyGenie.Common.Domain.Users;

namespace LinkawyGenie.Common.Domain.Knowledge;

/// <summary>
/// Value object representing the type of document being processed.
/// This helps determine the appropriate processing strategy and validation rules.
/// </summary>
public sealed class DocumentType : IValueObject
{
    private DocumentType(string value)
    {
        Value = value;
    }

    public string Value { get; }

    public static DocumentType Create(string value)
    {
        ThrowIfNullOrWhiteSpace(value, nameof(value));
        var trimmed = value.Trim().ToLowerInvariant();

        return trimmed switch
        {
            "pdf" => new DocumentType("pdf"),
            "docx" => new DocumentType("docx"),
            "txt" => new DocumentType("txt"),
            "md" => new DocumentType("md"),
            _ => throw new ArgumentException($"Unsupported document type: {value}", nameof(value)),
        };
    }

    public static DocumentType Pdf() => new("pdf");

    public static DocumentType Word() => new("docx");

    public static DocumentType Text() => new("txt");

    public static DocumentType Markdown() => new("md");

    public bool Equals(DocumentType? other) =>
        other is not null && Value.Equals(other.Value, StringComparison.OrdinalIgnoreCase);

    public override bool Equals(object? obj) => Equals(obj as DocumentType);

    public override int GetHashCode() => Value.GetHashCode(StringComparison.OrdinalIgnoreCase);

    public override string ToString() => Value;
}

/// <summary>
/// Value object representing the processing status of a document.
/// This tracks the lifecycle of document processing from upload to completion.
/// </summary>
public sealed class ProcessingStatus : IValueObject
{
    private ProcessingStatus(string value)
    {
        Value = value;
    }

    public string Value { get; }

    public static ProcessingStatus Create(string value)
    {
        ThrowIfNullOrWhiteSpace(value, nameof(value));
        var trimmed = value.Trim().ToLowerInvariant();

        return trimmed switch
        {
            "pending" => new ProcessingStatus("pending"),
            "processing" => new ProcessingStatus("processing"),
            "completed" => new ProcessingStatus("completed"),
            "failed" => new ProcessingStatus("failed"),
            "cancelled" => new ProcessingStatus("cancelled"),
            _ => throw new ArgumentException($"Invalid processing status: {value}", nameof(value)),
        };
    }

    public static ProcessingStatus Pending() => new("pending");

    public static ProcessingStatus Processing() => new("processing");

    public static ProcessingStatus Completed() => new("completed");

    public static ProcessingStatus Failed() => new("failed");

    public static ProcessingStatus Cancelled() => new("cancelled");

    public bool IsCompleted => Value == "completed";
    public bool IsFailed => Value == "failed";
    public bool IsProcessing => Value == "processing";
    public bool IsPending => Value == "pending";

    public bool Equals(ProcessingStatus? other) =>
        other is not null && Value.Equals(other.Value, StringComparison.OrdinalIgnoreCase);

    public override bool Equals(object? obj) => Equals(obj as ProcessingStatus);

    public override int GetHashCode() => Value.GetHashCode(StringComparison.OrdinalIgnoreCase);

    public override string ToString() => Value;
}

/// <summary>
/// Value object representing file metadata for uploaded documents.
/// This encapsulates file information in a type-safe manner.
/// </summary>
public sealed class FileMetadata : IValueObject
{
    public const int NameMaxLength = 255;
    public const long MaxFileSizeBytes = 50 * 1024 * 1024; // 50MB

    private FileMetadata(string fileName, long fileSizeBytes, string contentType, string? checksum)
    {
        FileName = fileName;
        FileSizeBytes = fileSizeBytes;
        ContentType = contentType;
        Checksum = checksum;
    }

    public string FileName { get; }
    public long FileSizeBytes { get; }
    public string ContentType { get; }
    public string? Checksum { get; }

    public static FileMetadata Create(
        string fileName,
        long fileSizeBytes,
        string contentType,
        string? checksum = null
    )
    {
        ThrowIfNullOrWhiteSpace(fileName, nameof(fileName));
        ThrowIfNullOrWhiteSpace(contentType, nameof(contentType));
        ThrowIfLessThan(fileSizeBytes, 1, nameof(fileSizeBytes));
        ThrowIfGreaterThan(fileSizeBytes, MaxFileSizeBytes, nameof(fileSizeBytes));

        var trimmedFileName = fileName.Trim();
        ThrowIfGreaterThan(trimmedFileName.Length, NameMaxLength, nameof(fileName));

        return new FileMetadata(
            trimmedFileName,
            fileSizeBytes,
            contentType.Trim(),
            checksum?.Trim()
        );
    }

    public bool Equals(FileMetadata? other) =>
        other is not null
        && FileName.Equals(other.FileName, StringComparison.OrdinalIgnoreCase)
        && FileSizeBytes == other.FileSizeBytes
        && ContentType.Equals(other.ContentType, StringComparison.OrdinalIgnoreCase)
        && Checksum == other.Checksum;

    public override bool Equals(object? obj) => Equals(obj as FileMetadata);

    public override int GetHashCode() =>
        HashCode.Combine(FileName, FileSizeBytes, ContentType, Checksum);

    public override string ToString() => $"{FileName} ({FileSizeBytes} bytes)";
}

/// <summary>
/// Aggregate root representing a document in the knowledge base.
/// This aggregate manages the document lifecycle from upload to processing completion.
/// It ensures that document processing follows business rules and maintains data integrity.
/// </summary>
public sealed class Document : AggregateRoot<DocumentId>
{
    private readonly List<DocumentChunk> _chunks = [];

    private Document() { }

    public UserId UploadedBy { get; private set; }
    public string Title { get; private set; } = null!;
    public string Description { get; private set; } = null!;
    public DocumentType Type { get; private set; } = null!;
    public FileMetadata FileMetadata { get; private set; } = null!;
    public ProcessingStatus Status { get; private set; } = null!;
    public string? StoragePath { get; private set; }
    public string? ProcessingError { get; private set; }
    public DateTimeOffset? ProcessedAt { get; private set; }
    public int ChunkCount { get; private set; }
    public long TotalTextLength { get; private set; }

    public IReadOnlyList<DocumentChunk> Chunks => _chunks.AsReadOnly();

    public static Document Upload(
        UserId uploadedBy,
        string title,
        string description,
        DocumentType type,
        FileMetadata fileMetadata,
        string storagePath
    )
    {
        ThrowIfNull(uploadedBy, nameof(uploadedBy));
        ThrowIfNullOrWhiteSpace(title, nameof(title));
        ThrowIfNullOrWhiteSpace(description, nameof(description));
        ThrowIfNull(type, nameof(type));
        ThrowIfNull(fileMetadata, nameof(fileMetadata));
        ThrowIfNullOrWhiteSpace(storagePath, nameof(storagePath));

        var document = new Document
        {
            Id = DocumentId.From(Guid.CreateVersion7()),
            UploadedBy = uploadedBy,
            Title = title.Trim(),
            Description = description.Trim(),
            Type = type,
            FileMetadata = fileMetadata,
            Status = ProcessingStatus.Pending(),
            StoragePath = storagePath.Trim(),
            ChunkCount = 0,
            TotalTextLength = 0,
        };

        document.AddDomainEvent(new DocumentUploadedEvent(document));
        return document;
    }

    public void StartProcessing()
    {
        if (!Status.IsPending)
            throw new InvalidOperationException(
                $"Cannot start processing document in {Status} status"
            );

        Status = ProcessingStatus.Processing();
        AddDomainEvent(new DocumentProcessingStartedEvent(this));
    }

    public void CompleteProcessing(int chunkCount, long totalTextLength)
    {
        if (!Status.IsProcessing)
            throw new InvalidOperationException(
                $"Cannot complete processing document in {Status} status"
            );

        ThrowIfLessThan(chunkCount, 0, nameof(chunkCount));
        ThrowIfLessThan(totalTextLength, 0, nameof(totalTextLength));

        Status = ProcessingStatus.Completed();
        ChunkCount = chunkCount;
        TotalTextLength = totalTextLength;
        ProcessedAt = DateTimeOffset.UtcNow;
        ProcessingError = null;

        AddDomainEvent(new DocumentProcessingCompletedEvent(this));
    }

    public void FailProcessing(string error)
    {
        ThrowIfNullOrWhiteSpace(error, nameof(error));

        Status = ProcessingStatus.Failed();
        ProcessingError = error.Trim();
        ProcessedAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new DocumentProcessingFailedEvent(this, error));
    }

    public void CancelProcessing()
    {
        if (Status.IsCompleted)
            throw new InvalidOperationException("Cannot cancel completed document processing");

        Status = ProcessingStatus.Cancelled();
        AddDomainEvent(new DocumentProcessingCancelledEvent(this));
    }

    public void AddChunk(DocumentChunk chunk)
    {
        ThrowIfNull(chunk, nameof(chunk));

        if (chunk.DocumentId != Id)
            throw new ArgumentException("Chunk does not belong to this document", nameof(chunk));

        _chunks.Add(chunk);
    }

    public void UpdateTitle(string newTitle)
    {
        ThrowIfNullOrWhiteSpace(newTitle, nameof(newTitle));
        Title = newTitle.Trim();
        AddDomainEvent(new DocumentTitleUpdatedEvent(this));
    }

    public void UpdateDescription(string newDescription)
    {
        ThrowIfNullOrWhiteSpace(newDescription, nameof(newDescription));
        Description = newDescription.Trim();
        AddDomainEvent(new DocumentDescriptionUpdatedEvent(this));
    }

    public void Delete()
    {
        if (Status.IsProcessing)
            throw new InvalidOperationException("Cannot delete document while processing");

        AddDomainEvent(new DocumentDeletedEvent(this));
    }

    public bool IsProcessed => Status.IsCompleted;
    public bool IsProcessing => Status.IsProcessing;
    public bool IsFailed => Status.IsFailed;
    public bool CanBeDeleted => !Status.IsProcessing;
}

[ValueObject<Guid>]
public readonly partial struct DocumentId;

// Domain Events
public sealed record DocumentUploadedEvent(Document Document) : IDomainEvent;

public sealed record DocumentProcessingStartedEvent(Document Document) : IDomainEvent;

public sealed record DocumentProcessingCompletedEvent(Document Document) : IDomainEvent;

public sealed record DocumentProcessingFailedEvent(Document Document, string Error) : IDomainEvent;

public sealed record DocumentProcessingCancelledEvent(Document Document) : IDomainEvent;

public sealed record DocumentTitleUpdatedEvent(Document Document) : IDomainEvent;

public sealed record DocumentDescriptionUpdatedEvent(Document Document) : IDomainEvent;

public sealed record DocumentDeletedEvent(Document Document) : IDomainEvent;
