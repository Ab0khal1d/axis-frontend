using Azure;
using Azure.AI.OpenAI;
using Azure.Identity;
using Azure.Messaging.ServiceBus;
using LinkawyGenie.Common.Interfaces;
using LinkawyGenie.Common.Services;
using Microsoft.Extensions.DependencyInjection;

namespace LinkawyGenie.Features.Conversations;

public sealed class ConversationsFeature : IFeature
{
    public static string FeatureName => "Conversations";

    public static void ConfigureServices(IServiceCollection services, IConfiguration config)
    {
        services.Configure<AzureOpenAISettings>(config.GetSection(AzureOpenAISettings.SectionName));
        services.Configure<AzureServiceBusSettings>(
            config.GetSection(AzureServiceBusSettings.SectionName)
        );
        services.Configure<AzureSearchSettings>(config.GetSection(AzureSearchSettings.SectionName));

        var azureOpenAISettings = config
            .GetSection(AzureOpenAISettings.SectionName)
            .Get<AzureOpenAISettings>();

        var azureServiceBusSettings = config
            .GetSection(AzureServiceBusSettings.SectionName)
            .Get<AzureServiceBusSettings>();

        var azureSearchSettings = config
            .GetSection(AzureSearchSettings.SectionName)
            .Get<AzureSearchSettings>();

        services.AddScoped(sp =>
        {
            ThrowIfNull(azureOpenAISettings);
            AzureKeyCredential credential = new(azureOpenAISettings.ApiKey);
            AzureOpenAIClient azureClient = new(new Uri(azureOpenAISettings.Endpoint), credential);
            return azureClient;
        });

        services.AddScoped<IAzureOpenAIService, AzureOpenAIService>();

        //TODO: Enable Azure Service Bus when needed
        //services.AddScoped(sp =>
        //{
        //    var clientOptions = new ServiceBusClientOptions
        //    {
        //        TransportType = ServiceBusTransportType.AmqpTcp,
        //        RetryOptions = new ServiceBusRetryOptions
        //        {
        //            Mode = ServiceBusRetryMode.Exponential,
        //            MaxRetries = 3,
        //            Delay = TimeSpan.FromSeconds(1),
        //            MaxDelay = TimeSpan.FromSeconds(30),
        //            TryTimeout = TimeSpan.FromMinutes(1),
        //        },
        //    };
        //    ServiceBusClient client = new(azureServiceBusSettings.ConnectionString, clientOptions);
        //    return client;
        //});

        //services.AddScoped<IMessageQueuePublisher, AzureServiceBusPublisher>();
    }
}
