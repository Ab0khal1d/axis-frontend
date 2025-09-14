using LinkawyGenie.Common.Authentication;
using LinkawyGenie.Common.Contracts.Common;
using LinkawyGenie.Common.Domain.Users;
using LinkawyGenie.Common.Interfaces;
using LinkawyGenie.Host.Extensions;
using MediatR;

namespace LinkawyGenie.Features.Authentication.Queries;

/// <summary>
/// Query to get the current authenticated user information.
/// </summary>
public static class GetCurrentUserQuery
{
    public record Request() : IRequest<ErrorOr<Response>>;

    /// <summary>
    /// Response containing current user information.
    /// </summary>
    public sealed record Response(
        Guid UserId,
        string DisplayName,
        string Email,
        bool IsAdmin,
        IReadOnlyList<string> Roles,
        IReadOnlyList<string> Permissions
    );

    //public class Endpoint : IEndpoint
    //{
    //    public static void MapEndpoint(IEndpointRouteBuilder endpoints)
    //    {
    //        endpoints
    //            .MapApiGroup(AuthenticationFeature.FeatureName)
    //            .MapGet(
    //                "/me",
    //                async (ISender sender, Request request, CancellationToken ct) =>
    //                {
    //                    var result = await sender.Send(request, ct);
    //                    return result.Match(
    //                        response =>
    //                            TypedResults.Ok(ApiResponse<Response>.SuccessResponse(response)),
    //                        errors => CustomResult.Problem(errors)
    //                    );
    //                }
    //            )
    //            .WithName("GetCurrentUser")
    //            .ProducesGet<ApiResponse<Response>>();
    //    }
    //}

    internal sealed class Handler(ICurrentUserService userService)
        : IRequestHandler<Request, ErrorOr<Response>>
    {
        public async Task<ErrorOr<Response>> Handle(
            Request request,
            CancellationToken cancellationToken
        )
        {
            //if (!userService.IsAuthenticated())
            //{
            //    return Error.Unauthorized(description: "User is not authenticated");
            //}

            //var user = await userService.GetCurrentUserAsync();
            //if (user is null)
            //{
            //    return Error.NotFound(description: "User not found");
            //}

            //var isAdmin = await userService.IsAdminAsync();
            //var roles = userService.GetCurrentUserRoles().ToList();

            //// Get permissions (this would typically come from the access control system)
            //var permissions = new List<string>();
            //if (isAdmin)
            //{
            //    permissions.AddRange(
            //        [
            //            "knowledge.manage",
            //            "users.manage",
            //            "system.settings.manage",
            //            "system.metrics.view",
            //        ]
            //    );
            //}
            //else
            //{
            //    permissions.AddRange(["chat.ai", "conversations.view"]);
            //}

            //var response = new Response(
            //    user.Id.Value,
            //    user.DisplayName,
            //    user.Email,
            //    isAdmin,
            //    roles,
            //    permissions
            //);

            //return response;
            return Error.NotFound();
        }
    }
}
