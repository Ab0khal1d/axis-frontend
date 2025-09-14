//using LinkawyGenie.Common.Domain.Users;
//using Microsoft.AspNetCore.Http;

//namespace LinkawyGenie.Common.Authentication;

///// <summary>
///// Service for accessing the current authenticated user.
///// This provides a convenient way to get the current user throughout the application.
///// </summary>
//public interface ICurrentUserService
//{
//    /// <summary>
//    /// Gets the current user ID.
//    /// </summary>
//    /// <returns>The current user ID or null if not authenticated</returns>
//    UserId? GetCurrentUserId();

//    /// <summary>
//    /// Gets the current user ID or throws an exception if not authenticated.
//    /// </summary>
//    /// <returns>The current user ID</returns>
//    /// <exception cref="UnauthorizedAccessException">Thrown when user is not authenticated</exception>
//    UserId GetCurrentUserIdOrThrow();

//    /// <summary>
//    /// Gets the current user.
//    /// </summary>
//    /// <returns>The current user or null if not authenticated</returns>
//    Task<User?> GetCurrentUserAsync();

//    /// <summary>
//    /// Gets the current user or throws an exception if not authenticated.
//    /// </summary>
//    /// <returns>The current user</returns>
//    /// <exception cref="UnauthorizedAccessException">Thrown when user is not authenticated</exception>
//    Task<User> GetCurrentUserOrThrowAsync();

//    /// <summary>
//    /// Checks if the current user is authenticated.
//    /// </summary>
//    /// <returns>True if authenticated, false otherwise</returns>
//    bool IsAuthenticated();

//    /// <summary>
//    /// Gets the current user's email.
//    /// </summary>
//    /// <returns>The user's email or null if not available</returns>
//    string? GetCurrentUserEmail();

//    /// <summary>
//    /// Gets the current user's display name.
//    /// </summary>
//    /// <returns>The user's display name or null if not available</returns>
//    string? GetCurrentUserDisplayName();

//    /// <summary>
//    /// Gets the current user's roles.
//    /// </summary>
//    /// <returns>Collection of user roles</returns>
//    IEnumerable<string> GetCurrentUserRoles();

//    /// <summary>
//    /// Checks if the current user has a specific role.
//    /// </summary>
//    /// <param name="role">The role to check</param>
//    /// <returns>True if the user has the role, false otherwise</returns>
//    Task<bool> HasRoleAsync(string role);

//    /// <summary>
//    /// Checks if the current user has a specific permission.
//    /// </summary>
//    /// <param name="permission">The permission to check</param>
//    /// <returns>True if the user has the permission, false otherwise</returns>
//    Task<bool> HasPermissionAsync(string permission);

//    /// <summary>
//    /// Checks if the current user is an admin.
//    /// </summary>
//    /// <returns>True if the user is an admin, false otherwise</returns>
//    Task<bool> IsAdminAsync();
//}
