#pragma warning disable AOAI001
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Numerics;
using System.Runtime.ConstrainedExecution;
using System.Threading;
using System.Threading.Tasks;
using Azure;
using Azure.AI.OpenAI;
using Azure.AI.OpenAI.Chat;
using LinkawyGenie.Common.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.SqlServer.Server;
using OpenAI;
using OpenAI.Assistants;
using OpenAI.Chat;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace LinkawyGenie.Common.Services;

/// <summary>
/// Clean, focused Azure OpenAI service implementation using Azure.AI.OpenAI SDK.
/// - Streaming chat: yields incremental string tokens (ready for SSE wrapping by endpoints)
/// - Non-streaming chat
/// - Embeddings
/// - Image generation
/// </summary>
public sealed class AzureOpenAIService : IAzureOpenAIService
{
    private readonly AzureOpenAISettings _settings;
    private readonly AzureSearchSettings _searchSettings;
    private readonly ChatClient _client;

    public AzureOpenAIService(
        IOptions<AzureOpenAISettings> openAISettings,
        IOptions<AzureSearchSettings> searchSettings,
        AzureOpenAIClient client
    )
    {
        _settings = openAISettings.Value;
        _searchSettings = searchSettings.Value;
        _client = client.GetChatClient(_settings.DefaultDeployment);
    }

    public async IAsyncEnumerable<string> StreamChatCompletionsAsync(
        IEnumerable<ChatMessage> messages,
        [System.Runtime.CompilerServices.EnumeratorCancellation]
            CancellationToken cancellationToken = default
    )
    {
        PrependSystemMessage(messages);
        var options = BuildChatOptionsRAG();

        await foreach (
            var update in _client.CompleteChatStreamingAsync(messages, options, cancellationToken)
        )
        {
            ChatMessageContext chatMessageContext = update.GetMessageContext();
            var file = chatMessageContext?.RetrievedDocuments;
            var citations = chatMessageContext?.Citations;

            foreach (var content in update.ContentUpdate)
            {
                var text = content.Text;
                if (!string.IsNullOrEmpty(text))
                    yield return text;
            }
        }
    }

    public Task<string> GetConversationTitleAsync(
        IEnumerable<ChatMessage> messages,
        CancellationToken cancellationToken = default
    )
    {
        PrependGetTitleSystemMessage(messages);
        return GetChatCompletionAsync(messages, BuildChatOptions(), cancellationToken);
    }

    public async Task<string> GetChatCompletionsAsync(
        IEnumerable<ChatMessage> messages,
        CancellationToken cancellationToken = default
    )
    {
        PrependSystemMessage(messages);
        return await GetChatCompletionAsync(messages, BuildChatOptionsRAG(), cancellationToken);
    }

    private async Task<string> GetChatCompletionAsync(
        IEnumerable<ChatMessage> messages,
        ChatCompletionOptions options,
        CancellationToken cancellationToken
    )
    {
        var response = await _client.CompleteChatAsync(messages, options, cancellationToken);
        return response.Value.Content[0].Text;
    }

    private void PrependSystemMessage(IEnumerable<ChatMessage> messages)
    {
        var systemMessage = ChatMessage.CreateSystemMessage(
            @"You are an HR Assistant for Link Development (Linkdev).

### Role
- Provide professional, accurate, and concise answers to employee questions about:
  - HR policies and procedures  
  - Benefits and entitlements  
  - Internal systems and tools  
  - Company resources  

### Sources of Truth
- Company website: https://linkdevelopment.com  
- Internal HR system: https://intra.performly.com/app  
- Retrieved documents provided by the system DONT INCLUDE citations like [doc1], [doc2] in your answers.

### Rules
1. Only answer using the information from the sources above.  
2. Do NOT invent, assume, or speculate about policies.  
3. Do NOT include inline citations like [doc1], [doc2].  
4. If the required information is not available in the sources, respond with:  
   *“Please refer to hr@linkdev.com for further assistance.”*  

### Style & Tone
- Maintain a clear, professional, and supportive tone.  
- Keep answers structured and easy to read:  
  - Use bullet points for lists  
  - Use short paragraphs for explanations  
  - Use headings if needed  
"
        );
        ((IList<ChatMessage>)messages).Insert(0, systemMessage);
    }

    private void PrependGetTitleSystemMessage(IEnumerable<ChatMessage> messages)
    {
        var systemMessage = ChatMessage.CreateSystemMessage(
            @"You are an expert at creating concise and descriptive titles for conversations based on their content.
### Role
- Analyze the conversation history to understand the main topics and themes discussed.
### Rules
1. Create a title that is no longer than 4 words.
2. Ensure the title accurately reflects the primary subject of the conversation.
3. Avoid using generic titles like 'Chat' or 'Conversation'.
4. You Are Assistant so Avoid using 'User' or 'Assistant' in the title.
### Style & Tone
  Keep the title clear, concise, and relevant to the conversation content.
### Example
    Conversation: 
        User: How do I reset my password?
        Assistant: You can reset your password by clicking on 'Forgot Password' on the login page.
    Title: Password Reset Instructions
"
        );
        ((IList<ChatMessage>)messages).Insert(0, systemMessage);
    }

    private ChatCompletionOptions BuildChatOptionsRAG()
    {
        var options = new ChatCompletionOptions()
        {
            Temperature = _settings.Temperature,
            TopP = _settings.TopP,
            PresencePenalty = _settings.PresencePenalty,
            FrequencyPenalty = _settings.FrequencyPenalty,
            MaxOutputTokenCount = _settings.MaxTokens,
        };

        ThrowIfNull(_searchSettings);
        options.AddDataSource(
            new AzureSearchChatDataSource()
            {
                Endpoint = new Uri(_searchSettings.Endpoint),
                IndexName = _searchSettings.IndexName,
                Authentication = DataSourceAuthentication.FromApiKey(_searchSettings.ApiKey),
            }
        );

        return options;
    }

    private ChatCompletionOptions BuildChatOptions() =>
        new ChatCompletionOptions()
        {
            Temperature = _settings.Temperature,
            TopP = _settings.TopP,
            PresencePenalty = _settings.PresencePenalty,
            FrequencyPenalty = _settings.FrequencyPenalty,
            MaxOutputTokenCount = _settings.MaxTokens,
        };
}
