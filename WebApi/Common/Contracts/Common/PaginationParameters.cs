namespace LinkawyGenie.Common.Contracts.Common;

/// <summary>
/// Standard pagination parameters for list endpoints.
/// This provides consistent pagination input across all list APIs.
/// </summary>
public sealed record PaginationParameters(
    int PageNumber = 1,
    int PageSize = 20,
    string? SortBy = null,
    string? SortDirection = null
)
{
    public const int MinPageNumber = 1;
    public const int MinPageSize = 1;
    public const int MaxPageSize = 100;

    public static PaginationParameters Create(
        int pageNumber = 1,
        int pageSize = 20,
        string? sortBy = null,
        string? sortDirection = null
    )
    {
        var validPageNumber = Math.Max(MinPageNumber, pageNumber);
        var validPageSize = Math.Clamp(pageSize, MinPageSize, MaxPageSize);
        var validSortDirection = string.IsNullOrWhiteSpace(sortDirection)
            ? null
            : sortDirection.ToLowerInvariant() switch
            {
                "asc" or "ascending" => "asc",
                "desc" or "descending" => "desc",
                _ => null,
            };

        return new PaginationParameters(
            PageNumber: validPageNumber,
            PageSize: validPageSize,
            SortBy: string.IsNullOrWhiteSpace(sortBy) ? null : sortBy.Trim(),
            SortDirection: validSortDirection
        );
    }
}
