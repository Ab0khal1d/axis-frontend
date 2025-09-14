public class AzureOpenAISettings
{
    public const string SectionName = "AzureOpenAI";
    public string Endpoint { get; set; }
    public string ApiKey { get; set; }
    public string DefaultDeployment { get; set; }
    public int MaxTokens { get; set; }
    public float Temperature { get; set; }
    public float TopP { get; set; }
    public float FrequencyPenalty { get; set; }
    public float PresencePenalty { get; set; }
}

public class AzureSearchSettings
{
    public const string SectionName = "AzureSearch";
    public string Endpoint { get; set; }
    public string ApiKey { get; set; }
    public string IndexName { get; set; }
}

public class AzureServiceBusSettings
{
    public const string SectionName = "AzureServiceBus";
    public string ConnectionString { get; set; }
    public string CreateMessageQueue { get; set; }
}
