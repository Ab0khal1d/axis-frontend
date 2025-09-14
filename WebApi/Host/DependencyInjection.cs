using System.Text.Json.Serialization;
using LinkawyGenie.Common.Behaviours;
using LinkawyGenie.Common.Interfaces;
using LinkawyGenie.Common.Services;
using Microsoft.AspNetCore.Http.Json;

namespace LinkawyGenie.Host;

public static class DependencyInjection
{
    public static void AddWebApi(this IHostApplicationBuilder builder)
    {
        var services = builder.Services;

        services.AddHttpContextAccessor();

        services.AddScoped<ICurrentUserService, CurrentUserService>();

        services.AddOpenApi();

        builder.Services.Configure<JsonOptions>(options =>
        {
            options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
        });
    }

    public static void AddApplication(this IHostApplicationBuilder builder)
    {
        var applicationAssembly = typeof(DependencyInjection).Assembly;
        var services = builder.Services;

        services.AddValidatorsFromAssembly(applicationAssembly, includeInternalTypes: true);

        builder.Services.AddApplicationInsightsTelemetry(
            new Microsoft.ApplicationInsights.AspNetCore.Extensions.ApplicationInsightsServiceOptions
            {
                ConnectionString = builder.Configuration["APPLICATIONINSIGHTS_CONNECTION_STRING"],
            }
        );

        services.AddMediatR(config =>
        {
            config.RegisterServicesFromAssembly(applicationAssembly);

            config.AddOpenBehavior(typeof(UnhandledExceptionBehaviour<,>));

            // NOTE: Switch to ValidationExceptionBehavior if you want to use exceptions over the result pattern for flow control
            // config.AddOpenBehavior(typeof(ValidationExceptionBehaviour<,>));
            config.AddOpenBehavior(typeof(ValidationErrorOrResultBehavior<,>));

            config.AddOpenBehavior(typeof(PerformanceBehaviour<,>));
        });
    }
}
