namespace LinkawyGenie.Common.Features;

public interface IFeature
{
    static abstract string FeatureName { get; }
    static abstract void ConfigureServices(IServiceCollection services, IConfiguration config);
}
