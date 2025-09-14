using System.Security.Claims;
using LinkawyGenie.Common.Interfaces;

namespace LinkawyGenie.Common.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public string? UserId =>
        httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
}
