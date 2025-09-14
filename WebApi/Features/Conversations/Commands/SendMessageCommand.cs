using System.Net.ServerSentEvents;
using System.Runtime.CompilerServices;
using System.Text.Json.Serialization;
using Azure.AI.OpenAI;
using Azure.AI.OpenAI.Chat;
using LinkawyGenie.Common.Constants;
using LinkawyGenie.Common.Contracts.Common;
using LinkawyGenie.Common.Domain.Authentication;
using LinkawyGenie.Common.Domain.Conversations;
using LinkawyGenie.Common.Extensions;
using LinkawyGenie.Common.Interfaces;
using LinkawyGenie.Common.Persistence;
using LinkawyGenie.Host.Extensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using OpenAI.Chat;

namespace LinkawyGenie.Features.Conversations.Commands;

public static class SendMessageCommand
{
    public record Request(string Content, Guid ParentMessageId, IEnumerable<MessageItem> History)
        : IStreamRequest<ErrorOr<SseItem<MessageChunk>>>
    {
        [JsonIgnore]
        public Guid ConversationId { get; set; }
    }

    public sealed record MessageItem(
        Guid? Id,
        string Content,
        ChatMessageRole Author,
        DateTime? CreatedAt
    );

    public record MessageChunk(string Content);

    public class Endpoint : IEndpoint
    {
        private static async IAsyncEnumerable<SseItem<MessageChunk>> ProcessStream(
            IAsyncEnumerable<ErrorOr<SseItem<MessageChunk>>> stream
        )
        {
            await foreach (var result in stream)
            {
                if (result.IsError)
                {
                    // For errors in streaming, we can't easily send them through SSE
                    // The client should handle this by checking for errors in the response
                    foreach (var error in result.Errors)
                    {
                        var sseError = new SseItem<MessageChunk>(
                            new MessageChunk($"{error.Code}: {error.Description}"),
                            eventType: SseEventsNames.Error
                        )
                        {
                            ReconnectionInterval = TimeSpan.FromSeconds(10),
                        };

                        yield return sseError;
                    }
                    yield break;
                }
                else
                {
                    yield return result.Value;
                }
            }
        }

        public static void MapEndpoint(IEndpointRouteBuilder endpoints)
        {
            endpoints
                .MapApiGroup(ConversationsFeature.FeatureName)
                .MapPost(
                    "/{conversationId:guid}/messages",
                    (Guid conversationId, ISender sender, Request body, CancellationToken ct) =>
                    {
                        body.ConversationId = conversationId;
                        var stream = sender.CreateStream(body, ct);

                        return TypedResults.ServerSentEvents(ProcessStream(stream));
                    }
                )
                .WithName("SendMessage")
                .ProducesPostStream();
        }
    }

    internal sealed class Handler(
        ApplicationDbContext dbContext,
        IAzureOpenAIService openAIService,
        IDistributedCache cache
    ) : IStreamRequestHandler<Request, ErrorOr<SseItem<MessageChunk>>>
    {
        public async IAsyncEnumerable<ErrorOr<SseItem<MessageChunk>>> Handle(
            Request request,
            [EnumeratorCancellation] CancellationToken cancellationToken
        )
        {
            var convId = ConversationId.From(request.ConversationId);
            var conversation = await dbContext.Conversations.FirstOrDefaultAsync(
                c => c.Id == convId,
                cancellationToken
            );

            if (conversation is null)
            {
                yield return ConversationErrors.NotFound;
                yield break;
            }

            var incomingMessage = conversation.AddUserMessage(
                request.Content,
                MessageId.From(request.History.LastOrDefault()?.Id ?? Guid.Empty)
            );

            // based on incoming message text search cache for existing response
            var cachedResponse = await cache.GetStringAsync(
                incomingMessage.Content.Trim(),
                cancellationToken
            );
            if (cachedResponse is not null)
            {
                yield return new SseItem<MessageChunk>(
                    new MessageChunk(cachedResponse),
                    eventType: SseEventsNames.Message
                )
                {
                    ReconnectionInterval = TimeSpan.FromSeconds(3),
                };
            }
            else
            {
                List<ChatMessage> history = request
                    .History.Select<MessageItem, ChatMessage>(m =>
                    {
                        return m.Author == ChatMessageRole.User
                                ? ChatMessage.CreateUserMessage(m.Content)
                            : m.Author == ChatMessageRole.Assistant
                                ? ChatMessage.CreateAssistantMessage(m.Content)
                            : ChatMessage.CreateSystemMessage(m.Content);
                    })
                    .ToList();

                history.Add(ChatMessage.CreateUserMessage(request.Content));

                var responseStringBuilder = new System.Text.StringBuilder();
                await foreach (
                    var chunk in openAIService.StreamChatCompletionsAsync(
                        history,
                        cancellationToken
                    )
                )
                {
                    responseStringBuilder.Append(chunk);
                    var completion = chunk;
                    yield return new SseItem<MessageChunk>(
                        new MessageChunk(chunk),
                        eventType: SseEventsNames.Message
                    )
                    {
                        ReconnectionInterval = TimeSpan.FromSeconds(3),
                    };
                }

                cachedResponse = responseStringBuilder.ToString();
                await cache.SetStringAsync(
                    incomingMessage.Content.Trim(),
                    cachedResponse,
                    new DistributedCacheEntryOptions()
                    {
                        AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(1),
                        SlidingExpiration = TimeSpan.FromHours(3),
                    },
                    cancellationToken
                );
            }

            var responseMessage = conversation.AddAssistantMessage(
                cachedResponse,
                incomingMessage.Id
            );

            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
