using LinkawyGenie.Common.Domain.Users;

namespace LinkawyGenie.Common.Domain.Authentication;

/// <summary>
/// Specification for retrieving access control by user ID.
/// This provides a base query for user access control data.
/// </summary>
public sealed class AccessControlByUserIdSpec : SingleResultSpecification<AccessControl>
{
    public AccessControlByUserIdSpec(UserId userId)
    {
        Query.Where(ac => ac.UserId == userId);
    }
}

/// <summary>
/// Specification for retrieving active access controls.
/// This filters access controls that are currently active.
/// </summary>
public sealed class ActiveAccessControlsSpec : Specification<AccessControl>
{
    public ActiveAccessControlsSpec()
    {
        Query.Where(ac => ac.IsActive);
    }
}

/// <summary>
/// Specification for retrieving access controls with pagination and ordering.
/// This includes proper ordering by creation date for access control lists.
/// </summary>
public sealed class AccessControlsWithPaginationSpec : Specification<AccessControl>
{
    public AccessControlsWithPaginationSpec()
    {
        Query.OrderByDescending(ac => ac.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving access controls by role.
/// This enables filtering access controls by specific roles.
/// </summary>
public sealed class AccessControlsByRoleSpec : Specification<AccessControl>
{
    public AccessControlsByRoleSpec(string role)
    {
        Query.Where(ac =>
            ac.Roles.Any(r => r.Value.Equals(role, StringComparison.OrdinalIgnoreCase))
        );
    }
}

/// <summary>
/// Specification for retrieving access controls by permission.
/// This enables filtering access controls by specific permissions.
/// </summary>
public sealed class AccessControlsByPermissionSpec : Specification<AccessControl>
{
    public AccessControlsByPermissionSpec(string permission)
    {
        Query.Where(ac =>
            ac.Permissions.Any(p => p.Value.Equals(permission, StringComparison.OrdinalIgnoreCase))
        );
    }
}

/// <summary>
/// Specification for retrieving locked access controls.
/// This filters access controls that are currently locked.
/// </summary>
public sealed class LockedAccessControlsSpec : Specification<AccessControl>
{
    public LockedAccessControlsSpec(DateTimeOffset currentTime)
    {
        Query.Where(ac => ac.LockedUntil.HasValue && ac.LockedUntil.Value > currentTime);
    }
}

/// <summary>
/// Specification for retrieving access controls with recent activity.
/// This filters access controls that have been active within a specified time period.
/// </summary>
public sealed class AccessControlsWithRecentActivitySpec : Specification<AccessControl>
{
    public AccessControlsWithRecentActivitySpec(DateTimeOffset since)
    {
        Query.Where(ac => ac.LastAccessAt >= since).OrderByDescending(ac => ac.LastAccessAt);
    }
}

/// <summary>
/// Specification for retrieving access controls with failed login attempts.
/// This filters access controls that have recent failed login attempts.
/// </summary>
public sealed class AccessControlsWithFailedAttemptsSpec : Specification<AccessControl>
{
    public AccessControlsWithFailedAttemptsSpec(int minAttempts)
    {
        Query
            .Where(ac => ac.FailedLoginAttempts >= minAttempts)
            .OrderByDescending(ac => ac.FailedLoginAttempts);
    }
}

/// <summary>
/// Specification for retrieving admin access controls.
/// This filters access controls that have admin roles.
/// </summary>
public sealed class AdminAccessControlsSpec : Specification<AccessControl>
{
    public AdminAccessControlsSpec()
    {
        Query.Where(ac =>
            ac.Roles.Any(r => r.Value.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        );
    }
}

/// <summary>
/// Specification for retrieving access controls created within a date range.
/// This enables filtering access controls by creation date.
/// </summary>
public sealed class AccessControlsByDateRangeSpec : Specification<AccessControl>
{
    public AccessControlsByDateRangeSpec(DateTimeOffset fromDate, DateTimeOffset toDate)
    {
        Query
            .Where(ac => ac.CreatedAt >= fromDate && ac.CreatedAt <= toDate)
            .OrderByDescending(ac => ac.CreatedAt);
    }
}
