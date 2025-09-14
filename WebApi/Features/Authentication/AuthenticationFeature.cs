namespace LinkawyGenie.Features.Authentication;

/// <summary>
/// Feature configuration for authentication endpoints.
/// </summary>
public sealed class AuthenticationFeature : IFeature
{
    public static string FeatureName => "Authentication";

    public static void ConfigureServices(IServiceCollection services, IConfiguration config)
    {
        // Authentication services are configured in Program.cs
        // This feature class is kept for consistency with other features
    }
}
