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
/// Query to retrieve all messages for a specific conversation.
/// This follows the existing pattern of using MediatR and Entity Framework.
/// </summary>
public static class GetConversationMessagesQuery
{
    public record Request(Guid ConversationId) : IRequest<ErrorOr<Response>>;

    /// <summary>
    /// Response containing the conversation details and all its messages.
    /// This provides comprehensive information about the conversation and its message history.
    /// </summary>
    public sealed record Response(
        Guid ConversationId,
        Guid UserId,
        string? Title,
        DateTime CreatedAtUtc,
        DateTime? LastActivityAtUtc,
        IReadOnlyList<MessageItem> Messages
    );

    public class Endpoint : IEndpoint
    {
        public static void MapEndpoint(IEndpointRouteBuilder endpoints)
        {
            endpoints
                .MapApiGroup(ConversationsFeature.FeatureName)
                .MapGet(
                    "/{conversationId:guid}/messages",
                    async (Guid conversationId, ISender sender, CancellationToken ct) =>
                    {
                        var result = await sender.Send(new Request(conversationId), ct);
                        return result.Match(
                            response =>
                                TypedResults.Ok(ApiResponse<Response>.SuccessResponse(response)),
                            errors => CustomResult.Problem(errors)
                        );
                    }
                )
                .WithName("GetConversationMessages")
                .Produces<ApiResponse<Response>>(StatusCodes.Status200OK)
                .ProducesProblem(StatusCodes.Status404NotFound);
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

            // Use specification to query the conversation with all its messages
            var conversation = await dbContext
                .Conversations.AsNoTracking()
                .WithSpecification(new ConversationByIdSpec(conversationId))
                .FirstOrDefaultAsync(cancellationToken);

            if (conversation is null)
                return Error.NotFound(description: "Conversation not found");

            // Map messages to response items
            var messageItems = conversation
                .Messages.OrderBy(m => m.CreatedAt)
                .Select(m => new MessageItem(
                    m.Id.Value,
                    m.Content,
                    m.Author,
                    m.CreatedAt.UtcDateTime
                ))
                .ToList();

            var response = new Response(
                conversation.Id.Value,
                conversation.UserId.Value,
                conversation.Title?.Value,
                conversation.CreatedAt.UtcDateTime,
                conversation.UpdatedAt?.UtcDateTime,
                messageItems
            );

            return response;
        }
    }
}
