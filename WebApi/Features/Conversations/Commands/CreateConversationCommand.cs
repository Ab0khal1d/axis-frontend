using LinkawyGenie.Common.Authentication;
using LinkawyGenie.Common.Contracts.Common;
using LinkawyGenie.Common.Domain.Conversations;
using LinkawyGenie.Common.Domain.Users;
using LinkawyGenie.Common.Interfaces;
using LinkawyGenie.Common.Persistence;
using LinkawyGenie.Features.Conversations;
using LinkawyGenie.Host.Extensions;
using MediatR;

namespace LinkawyGenie.Features.Conversations.Commands;

public static class CreateConversationCommand
{
    public record Request() : IRequest<ErrorOr<Guid>>;

    public class Endpoint : IEndpoint
    {
        public static void MapEndpoint(IEndpointRouteBuilder endpoints)
        {
            endpoints
                .MapApiGroup(ConversationsFeature.FeatureName)
                .MapPost(
                    "/",
                    async (ISender sender, Request request, CancellationToken ct) =>
                    {
                        var result = await sender.Send(request, ct);
                        return result.Match(
                            id =>
                                TypedResults.Created(
                                    $"/api/{ConversationsFeature.FeatureName}/{id}",
                                    ApiResponse<Guid>.SuccessResponse(id)
                                ),
                            errors => CustomResult.Problem(errors)
                        );
                    }
                )
                .WithName("CreateConversation")
                .ProducesPost<ApiResponse<Guid?>>();
        }
    }

    internal sealed class Handler(ApplicationDbContext dbContext, ICurrentUserService userService)
        : IRequestHandler<Request, ErrorOr<Guid>>
    {
        public async Task<ErrorOr<Guid>> Handle(
            Request request,
            CancellationToken cancellationToken
        )
        {
            var userId = userService.UserId;

            if (userId == null || userId == Guid.Empty.ToString())
            {
                return Error.Unauthorized();
            }
            var conversation = Conversation.Start(UserId.From(Guid.Parse((string)userId)));

            await dbContext.Conversations.AddAsync(conversation, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);

            return conversation.Id.Value;
        }
    }
}
