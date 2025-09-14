using LinkawyGenie.Common.Domain.Users;

namespace LinkawyGenie.Common.Domain.Knowledge;

/// <summary>
/// Specification for retrieving a document by its ID.
/// This includes all related chunks for complete document data.
/// </summary>
public sealed class DocumentByIdSpec : SingleResultSpecification<Document>
{
    public DocumentByIdSpec(DocumentId documentId)
    {
        Query.Where(d => d.Id == documentId).Include(d => d.Chunks);
    }
}

/// <summary>
/// Specification for retrieving documents by uploader.
/// This provides a base query for user-specific documents.
/// </summary>
public sealed class DocumentsByUploaderSpec : Specification<Document>
{
    public DocumentsByUploaderSpec(UserId uploadedBy)
    {
        Query.Where(d => d.UploadedBy == uploadedBy);
    }
}

/// <summary>
/// Specification for retrieving documents by type.
/// This enables filtering documents by their type (PDF, DOCX, etc.).
/// </summary>
public sealed class DocumentsByTypeSpec : Specification<Document>
{
    public DocumentsByTypeSpec(DocumentType documentType)
    {
        Query.Where(d => d.Type == documentType);
    }
}

/// <summary>
/// Specification for retrieving documents by processing status.
/// This enables filtering documents by their processing state.
/// </summary>
public sealed class DocumentsByStatusSpec : Specification<Document>
{
    public DocumentsByStatusSpec(ProcessingStatus status)
    {
        Query.Where(d => d.Status == status);
    }
}

/// <summary>
/// Specification for retrieving processed documents.
/// This filters documents that have been successfully processed.
/// </summary>
public sealed class ProcessedDocumentsSpec : Specification<Document>
{
    public ProcessedDocumentsSpec()
    {
        Query.Where(d => d.Status == ProcessingStatus.Completed());
    }
}

/// <summary>
/// Specification for retrieving documents with pagination and ordering.
/// This includes proper ordering by upload date for document lists.
/// </summary>
public sealed class DocumentsWithPaginationSpec : Specification<Document>
{
    public DocumentsWithPaginationSpec()
    {
        Query.OrderByDescending(d => d.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving documents by uploader with pagination.
/// This combines user filtering with proper ordering for paginated results.
/// </summary>
public sealed class UserDocumentsWithPaginationSpec : Specification<Document>
{
    public UserDocumentsWithPaginationSpec(UserId uploadedBy)
    {
        Query.Where(d => d.UploadedBy == uploadedBy).OrderByDescending(d => d.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving documents by title search.
/// This enables searching documents by title content.
/// </summary>
public sealed class DocumentsByTitleSearchSpec : Specification<Document>
{
    public DocumentsByTitleSearchSpec(string searchTerm)
    {
        Query.Where(d => d.Title.Contains(searchTerm)).OrderByDescending(d => d.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving documents created within a date range.
/// This enables filtering documents by creation date.
/// </summary>
public sealed class DocumentsByDateRangeSpec : Specification<Document>
{
    public DocumentsByDateRangeSpec(DateTimeOffset fromDate, DateTimeOffset toDate)
    {
        Query
            .Where(d => d.CreatedAt >= fromDate && d.CreatedAt <= toDate)
            .OrderByDescending(d => d.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving documents by file size range.
/// This enables filtering documents by their file size.
/// </summary>
public sealed class DocumentsByFileSizeSpec : Specification<Document>
{
    public DocumentsByFileSizeSpec(long minSize, long maxSize)
    {
        Query
            .Where(d =>
                d.FileMetadata.FileSizeBytes >= minSize && d.FileMetadata.FileSizeBytes <= maxSize
            )
            .OrderByDescending(d => d.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving a knowledge base by its ID.
/// This includes all related documents for complete knowledge base data.
/// </summary>
public sealed class KnowledgeBaseByIdSpec : SingleResultSpecification<KnowledgeBase>
{
    public KnowledgeBaseByIdSpec(KnowledgeBaseId knowledgeBaseId)
    {
        Query.Where(kb => kb.Id == knowledgeBaseId).Include(kb => kb.Documents);
    }
}

/// <summary>
/// Specification for retrieving knowledge bases by creator.
/// This provides a base query for user-specific knowledge bases.
/// </summary>
public sealed class KnowledgeBasesByCreatorSpec : Specification<KnowledgeBase>
{
    public KnowledgeBasesByCreatorSpec(UserId createdBy)
    {
        Query.Where(kb => kb.CreatedBy == createdBy);
    }
}

/// <summary>
/// Specification for retrieving active knowledge bases.
/// This filters knowledge bases that are currently active.
/// </summary>
public sealed class ActiveKnowledgeBasesSpec : Specification<KnowledgeBase>
{
    public ActiveKnowledgeBasesSpec()
    {
        Query.Where(kb => kb.Status == KnowledgeBaseStatus.Active());
    }
}

/// <summary>
/// Specification for retrieving knowledge bases with pagination and ordering.
/// This includes proper ordering by creation date for knowledge base lists.
/// </summary>
public sealed class KnowledgeBasesWithPaginationSpec : Specification<KnowledgeBase>
{
    public KnowledgeBasesWithPaginationSpec()
    {
        Query.OrderByDescending(kb => kb.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving document chunks by document ID.
/// This provides a base query for document chunks.
/// </summary>
public sealed class ChunksByDocumentIdSpec : Specification<DocumentChunk>
{
    public ChunksByDocumentIdSpec(DocumentId documentId)
    {
        Query.Where(c => c.DocumentId == documentId).OrderBy(c => c.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving processed document chunks.
/// This filters chunks that have been processed with embeddings.
/// </summary>
public sealed class ProcessedChunksSpec : Specification<DocumentChunk>
{
    public ProcessedChunksSpec()
    {
        Query.Where(c => c.ProcessedAt.HasValue);
    }
}

/// <summary>
/// Specification for retrieving search queries by user.
/// This provides a base query for user-specific search history.
/// </summary>
public sealed class SearchQueriesByUserSpec : Specification<SearchQuery>
{
    public SearchQueriesByUserSpec(UserId userId)
    {
        Query.Where(sq => sq.UserId == userId).OrderByDescending(sq => sq.ExecutedAt);
    }
}

/// <summary>
/// Specification for retrieving search queries by knowledge base.
/// This provides a base query for knowledge base-specific search history.
/// </summary>
public sealed class SearchQueriesByKnowledgeBaseSpec : Specification<SearchQuery>
{
    public SearchQueriesByKnowledgeBaseSpec(KnowledgeBaseId knowledgeBaseId)
    {
        Query
            .Where(sq => sq.KnowledgeBaseId == knowledgeBaseId)
            .OrderByDescending(sq => sq.ExecutedAt);
    }
}
