using Ardalis.Specification.EntityFrameworkCore;
using LinkawyGenie.Common.Contracts.Common;
using LinkawyGenie.Common.Domain.Conversations;
using LinkawyGenie.Common.Extensions;
using LinkawyGenie.Common.Persistence;
using LinkawyGenie.Host.Extensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LinkawyGenie.Features.Conversations.Queries;

public static class ListConversationsQuery
{
    public record Request(PaginationParameters Pagination) : IRequest<ErrorOr<Response>>;

    public sealed record ConversationItem(
        Guid Id,
        string? Title,
        DateTime CreatedAtUtc,
        DateTime? LastActivityAtUtc
    );

    public sealed record Response(PaginatedList<ConversationItem> Conversations);

    public class Endpoint : IEndpoint
    {
        public static void MapEndpoint(IEndpointRouteBuilder endpoints)
        {
            endpoints
                .MapApiGroup(ConversationsFeature.FeatureName)
                .MapGet(
                    "/",
                    async (ISender sender, int pageNumber, int pageSize, CancellationToken ct) =>
                    {
                        var pagination = PaginationParameters.Create(pageNumber, pageSize);
                        var result = await sender.Send(new Request(pagination), ct);
                        return result.Match(
                            response =>
                                TypedResults.Ok(ApiResponse<Response>.SuccessResponse(response)),
                            errors => CustomResult.Problem(errors)
                        );
                    }
                )
                .WithName("ListConversations")
                .Produces<ApiResponse<Response>>(StatusCodes.Status200OK);
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
            // Create query using specification
            var query = dbContext
                .Conversations.AsNoTracking()
                .WithSpecification(new ConversationsWithPaginationSpec())
                .Select(c => new ConversationItem(
                    c.Id.Value,
                    c.Title != null ? c.Title.Value : null,
                    c.CreatedAt.UtcDateTime,
                    c.UpdatedAt == null ? null : c.UpdatedAt.Value.UtcDateTime
                ));

            // Create paginated list using extension method
            var paginatedConversations = await query.PaginatedListAsync(
                request.Pagination.PageNumber,
                request.Pagination.PageSize,
                cancellationToken
            );

            return new Response(paginatedConversations);
        }
    }
}
