using LinkawyGenie.Common.Contracts.Common;

namespace LinkawyGenie.Common.Extensions;

public static class PaginationExtension
{
    public static Task<PaginatedList<TDestination>> PaginatedListAsync<TDestination>(
        this IQueryable<TDestination> queryable,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default
    )
    {
        return PaginatedList<TDestination>.CreateAsync(
            queryable,
            pageNumber,
            pageSize,
            cancellationToken
        );
    }
}
