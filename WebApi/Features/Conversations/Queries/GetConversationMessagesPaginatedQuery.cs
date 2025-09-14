using Ardalis.Specification.EntityFrameworkCore;
using LinkawyGenie.Common.Contracts.Common;
using LinkawyGenie.Common.Domain.Conversations;
using LinkawyGenie.Common.Extensions;
using LinkawyGenie.Common.Persistence;
using LinkawyGenie.Host.Extensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using static LinkawyGenie.Features.Conversations.Commands.SendMessageCommand;

namespace LinkawyGenie.Features.Conversations.Queries;

/// <summary>
/// Query to retrieve paginated messages for a specific conversation.
/// This provides efficient retrieval of messages for conversations with large message histories.
/// </summary>
public static class GetConversationMessagesPaginatedQuery
{
    public record Request(Guid ConversationId, PaginationParameters Pagination)
        : IRequest<ErrorOr<Response>>;

    /// <summary>
    /// Response containing the conversation details and paginated messages.
    /// This provides conversation information along with paginated message history.
    /// </summary>
    public sealed record Response(
        Guid ConversationId,
        Guid UserId,
        string? Title,
        DateTime CreatedAtUtc,
        DateTime? LastActivityAtUtc,
        PaginatedList<MessageItem> Messages
    );

    public class Endpoint : IEndpoint
    {
        public static void MapEndpoint(IEndpointRouteBuilder endpoints)
        {
            endpoints
                .MapApiGroup(ConversationsFeature.FeatureName)
                .MapGet(
                    "/{conversationId:guid}/messages/paginated",
                    async (
                        Guid conversationId,
                        ISender sender,
                        int pageNumber,
                        int pageSize,
                        CancellationToken ct
                    ) =>
                    {
                        var pagination = PaginationParameters.Create(pageNumber, pageSize);
                        var result = await sender.Send(new Request(conversationId, pagination), ct);
                        return result.Match(
                            response =>
                                TypedResults.Ok(ApiResponse<Response>.SuccessResponse(response)),
                            errors => CustomResult.Problem(errors)
                        );
                    }
                )
                .WithName("GetConversationMessagesPaginated")
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
            var conversationId = ConversationId.From(request.ConversationId);

            // First, check if conversation exists using specification
            var conversation = await dbContext
                .Conversations.AsNoTracking()
                .WithSpecification(new ConversationByIdSpec(conversationId))
                .FirstOrDefaultAsync(cancellationToken);

            if (conversation is null)
                return Error.NotFound(description: "Conversation not found");

            // Create query for messages using specification
            var messagesQuery = dbContext
                .Messages.AsNoTracking()
                .WithSpecification(new MessagesByConversationIdSpec(conversationId))
                .Select(m => new MessageItem(
                    m.Id.Value,
                    m.Content,
                    m.Author,
                    m.CreatedAt.UtcDateTime
                ));

            // Create paginated list using extension method
            var paginatedMessages = await messagesQuery.PaginatedListAsync(
                request.Pagination.PageNumber,
                request.Pagination.PageSize,
                cancellationToken
            );

            var response = new Response(
                conversation.Id.Value,
                conversation.UserId.Value,
                conversation.Title?.Value,
                conversation.CreatedAt.UtcDateTime,
                conversation.UpdatedAt?.UtcDateTime,
                paginatedMessages
            );

            return response;
        }
    }
}
