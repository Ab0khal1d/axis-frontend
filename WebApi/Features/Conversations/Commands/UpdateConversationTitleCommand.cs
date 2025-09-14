using System.Text.Json.Serialization;
using LinkawyGenie.Common.Authentication;
using LinkawyGenie.Common.Contracts.Common;
using LinkawyGenie.Common.Domain.Conversations;
using LinkawyGenie.Common.Domain.Users;
using LinkawyGenie.Common.Interfaces;
using LinkawyGenie.Common.Persistence;
using LinkawyGenie.Features.Conversations;
using LinkawyGenie.Host.Extensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OpenAI.Chat;
using static LinkawyGenie.Features.Conversations.Commands.SendMessageCommand;

namespace LinkawyGenie.Features.Conversations.Commands;

public static class UpdateConversationTitleCommand
{
    public record Request(IEnumerable<MessageItem> History) : IRequest<ErrorOr<Response>>
    {
        [JsonIgnore]
        public Guid ConversationId { get; set; }
    };

    public sealed record Response(Guid ConversationId, string Title, DateTime LastUpdatedAt);

    public class Endpoint : IEndpoint
    {
        public static void MapEndpoint(IEndpointRouteBuilder endpoints)
        {
            endpoints
                .MapApiGroup(ConversationsFeature.FeatureName)
                .MapPut(
                    "/{conversationId:guid}/title",
                    async (
                        Guid conversationId,
                        ISender sender,
                        Request request,
                        CancellationToken ct
                    ) =>
                    {
                        request.ConversationId = conversationId;
                        var result = await sender.Send(request, ct);
                        return result.Match(
                            success =>
                                TypedResults.Ok(ApiResponse<Response>.SuccessResponse(success)),
                            errors => CustomResult.Problem(errors)
                        );
                    }
                )
                .WithName("UpdateConversationTitle")
                .ProducesPut<ApiResponse<Response>>();
        }
    }

    internal sealed class Handler(
        ApplicationDbContext dbContext,
        ICurrentUserService userService,
        IAzureOpenAIService openAIService
    ) : IRequestHandler<Request, ErrorOr<Response>>
    {
        public async Task<ErrorOr<Response>> Handle(
            Request request,
            CancellationToken cancellationToken
        )
        {
            var conversationId = ConversationId.From(request.ConversationId);
            var conversation = await dbContext.Conversations.FirstOrDefaultAsync(
                c => c.Id == conversationId,
                cancellationToken
            );

            if (conversation is null)
            {
                return ConversationErrors.NotFound;
            }

            string chatHistoryToString = string.Join(
                "\n",
                request.History.Select(m => $"{m.Author}: {m.Content}")
            );

            var history = new List<ChatMessage>();
            history.Add(
                ChatMessage.CreateUserMessage(
                    $"Generate a concise and descriptive title for the following conversation:\n{chatHistoryToString}\n"
                )
            );

            var title = await openAIService.GetConversationTitleAsync(history, cancellationToken);

            if (string.IsNullOrWhiteSpace(title))
            {
                return Error.Failure("Failed to generate a title for the conversation");
            }

            conversation.SetTitle(ConversationTitle.Create(title));

            await dbContext.SaveChangesAsync(cancellationToken);

            return new Response(
                conversation.Id.Value,
                conversation.Title.Value,
                conversation.UpdatedAt.Value.UtcDateTime
            );
        }
    }
}
