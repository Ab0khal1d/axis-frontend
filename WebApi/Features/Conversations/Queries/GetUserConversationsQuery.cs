using Ardalis.Specification.EntityFrameworkCore;
using LinkawyGenie.Common.Contracts.Common;
using LinkawyGenie.Common.Domain.Conversations;
using LinkawyGenie.Common.Domain.Users;
using LinkawyGenie.Common.Extensions;
using LinkawyGenie.Common.Persistence;
using LinkawyGenie.Host.Extensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinkawyGenie.Features.Conversations.Queries;

/// <summary>
/// Query to retrieve conversations for a specific user with pagination.
/// This demonstrates the use of specifications and pagination extension.
/// </summary>
public static class GetUserConversationsQuery
{
    public record Request(Guid UserId, PaginationParameters Pagination)
        : IRequest<ErrorOr<Response>>;

    /// <summary>
    /// Response containing paginated user conversations.
    /// This provides conversation information with pagination metadata.
    /// </summary>
    public sealed record Response(Guid UserId, PaginatedList<ConversationItem> Conversations);

    /// <summary>
    /// Individual conversation item with essential details.
    /// This provides conversation summary information for lists.
    /// </summary>
    public sealed record ConversationItem(
        Guid Id,
        string? Title,
        DateTime CreatedAtUtc,
        DateTime? LastActivityAtUtc,
        int MessageCount
    );

    public class Endpoint : IEndpoint
    {
        public static void MapEndpoint(IEndpointRouteBuilder endpoints)
        {
            endpoints
                .MapApiGroup(ConversationsFeature.FeatureName)
                .MapGet(
                    "/user/{userId:guid}",
                    async (
                        Guid userId,
                        ISender sender,
                        int pageNumber,
                        int pageSize,
                        CancellationToken ct
                    ) =>
                    {
                        var pagination = PaginationParameters.Create(pageNumber, pageSize);
                        var result = await sender.Send(new Request(userId, pagination), ct);
                        return result.Match(
                            response =>
                                TypedResults.Ok(ApiResponse<Response>.SuccessResponse(response)),
                            errors => CustomResult.Problem(errors)
                        );
                    }
                )
                .WithName("GetUserConversations")
                .ProducesGet<ApiResponse<Response>>();
        }
    }

    internal sealed class Handler(ApplicationDbContext dbContext)
        : IRequestHandler<Request, ErrorOr<Response>>
    {
        public async Task<ErrorOr<Response>> Handle(
            Request request,
            CancellationToken cancellationToken
        )
        {
            var userId = UserId.From(request.UserId);

            // Create query using specification for user conversations with pagination
            var query = dbContext
                .Conversations.AsNoTracking()
                .WithSpecification(new UserConversationsWithPaginationSpec(userId))
                .Select(c => new ConversationItem(
                    c.Id.Value,
                    c.Title != null ? c.Title.Value : null,
                    c.CreatedAt.UtcDateTime,
                    c.UpdatedAt == null ? null : c.UpdatedAt.Value.UtcDateTime,
                    c.Messages.Count
                ));

            // Create paginated list using extension method
            var paginatedConversations = await query.PaginatedListAsync(
                request.Pagination.PageNumber,
                request.Pagination.PageSize,
                cancellationToken
            );

            var response = new Response(userId.Value, paginatedConversations);
            return response;
        }
    }
}
