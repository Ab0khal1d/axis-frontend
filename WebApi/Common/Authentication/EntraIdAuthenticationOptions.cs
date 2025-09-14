namespace LinkawyGenie.Common.Authentication;

/// <summary>
/// Configuration options for Microsoft Entra ID authentication.
/// This encapsulates all the settings needed for Entra ID integration.
/// </summary>
public sealed class EntraIdAuthenticationOptions
{
    public const string SectionName = "EntraId";

    /// <summary>
    /// The tenant ID for the Microsoft Entra ID tenant.
    /// </summary>
    public string TenantId { get; set; } = null!;

    /// <summary>
    /// The client ID (application ID) for the registered application in Entra ID.
    /// </summary>
    public string ClientId { get; set; } = null!;

    /// <summary>
    /// The client secret for the registered application (for confidential client flows).
    /// </summary>
    public string? ClientSecret { get; set; }

    /// <summary>
    /// The instance URL for Microsoft Entra ID (e.g., https://login.microsoftonline.com/).
    /// </summary>
    public string Instance { get; set; } = "https://login.microsoftonline.com/";

    /// <summary>
    /// The domain of the tenant (e.g., contoso.onmicrosoft.com).
    /// </summary>
    public string? Domain { get; set; }

    /// <summary>
    /// The redirect URI after successful authentication.
    /// </summary>
    public string RedirectUri { get; set; } = null!;

    /// <summary>
    /// The post logout redirect URI.
    /// </summary>
    public string PostLogoutRedirectUri { get; set; } = null!;

    /// <summary>
    /// The scopes to request during authentication.
    /// </summary>
    public string[] Scopes { get; set; } = ["openid", "profile", "email"];

    /// <summary>
    /// The audience for JWT tokens (usually the client ID).
    /// </summary>
    public string Audience { get; set; } = null!;

    /// <summary>
    /// The issuer URL for JWT token validation.
    /// </summary>
    public string Issuer { get; set; } = null!;

    /// <summary>
    /// Whether to require HTTPS for authentication.
    /// </summary>
    public bool RequireHttps { get; set; } = true;

    /// <summary>
    /// The cookie name for authentication.
    /// </summary>
    public string CookieName { get; set; } = "LinkawyGenie.Auth";

    /// <summary>
    /// The cookie expiration time.
    /// </summary>
    public TimeSpan CookieExpiration { get; set; } = TimeSpan.FromHours(8);

    /// <summary>
    /// Whether to use sliding expiration for cookies.
    /// </summary>
    public bool UseSlidingExpiration { get; set; } = true;

    /// <summary>
    /// The claim type to use for the user's unique identifier.
    /// </summary>
    public string UserIdClaimType { get; set; } = "oid";

    /// <summary>
    /// The claim type to use for the user's email.
    /// </summary>
    public string EmailClaimType { get; set; } = "email";

    /// <summary>
    /// The claim type to use for the user's display name.
    /// </summary>
    public string DisplayNameClaimType { get; set; } = "name";

    /// <summary>
    /// The claim type to use for the user's roles.
    /// </summary>
    public string RolesClaimType { get; set; } = "roles";

    /// <summary>
    /// The claim type to use for the user's groups.
    /// </summary>
    public string GroupsClaimType { get; set; } = "groups";

    /// <summary>
    /// Whether to automatically create users on first login.
    /// </summary>
    public bool AutoCreateUsers { get; set; } = true;

    /// <summary>
    /// The default role to assign to new users.
    /// </summary>
    public string DefaultUserRole { get; set; } = "User";

    /// <summary>
    /// The admin role name for administrative access.
    /// </summary>
    public string AdminRoleName { get; set; } = "Admin";

    /// <summary>
    /// The security group IDs that should be granted admin access.
    /// </summary>
    public string[] AdminGroupIds { get; set; } = [];

    /// <summary>
    /// The user principal names (UPNs) that should be granted admin access.
    /// </summary>
    public string[] AdminUserPrincipalNames { get; set; } = [];

    /// <summary>
    /// Whether to validate the token audience.
    /// </summary>
    public bool ValidateAudience { get; set; } = true;

    /// <summary>
    /// Whether to validate the token issuer.
    /// </summary>
    public bool ValidateIssuer { get; set; } = true;

    /// <summary>
    /// Whether to validate the token lifetime.
    /// </summary>
    public bool ValidateLifetime { get; set; } = true;

    /// <summary>
    /// The clock skew tolerance for token validation.
    /// </summary>
    public TimeSpan ClockSkew { get; set; } = TimeSpan.FromMinutes(5);

    /// <summary>
    /// The cache duration for token validation metadata.
    /// </summary>
    public TimeSpan MetadataCacheDuration { get; set; } = TimeSpan.FromHours(24);

    /// <summary>
    /// Whether to save tokens in the authentication cookie.
    /// </summary>
    public bool SaveTokens { get; set; } = true;

    /// <summary>
    /// The maximum age for the authentication cookie.
    /// </summary>
    public TimeSpan? CookieMaxAge { get; set; }

    /// <summary>
    /// Whether the authentication cookie is essential.
    /// </summary>
    public bool CookieIsEssential { get; set; } = true;

    /// <summary>
    /// The same site policy for the authentication cookie.
    /// </summary>
    public SameSiteMode CookieSameSite { get; set; } = SameSiteMode.Lax;

    /// <summary>
    /// Whether the authentication cookie is secure.
    /// </summary>
    public bool CookieSecure { get; set; } = true;

    /// <summary>
    /// The path for the authentication cookie.
    /// </summary>
    public string CookiePath { get; set; } = "/";

    /// <summary>
    /// Whether the authentication cookie is HTTP only.
    /// </summary>
    public bool CookieHttpOnly { get; set; } = true;
}
