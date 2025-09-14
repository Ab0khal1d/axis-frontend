using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Azure.AI.OpenAI;
using OpenAI.Chat;

namespace LinkawyGenie.Common.Interfaces;

/// <summary>
/// Minimal, clean service interface around Azure OpenAI client.
/// Exposes streaming and non-streaming chat, embeddings, and image generation.
/// Designed to be endpoint-agnostic; endpoints can wrap streaming as SSE.
/// </summary>
public interface IAzureOpenAIService
{
    /// <summary>
    /// Streams chat completion content chunks for the provided messages.
    /// Suitable for Server-Sent Events (SSE) by yielding incremental tokens.
    /// </summary>
    IAsyncEnumerable<string> StreamChatCompletionsAsync(
        IEnumerable<ChatMessage> messages,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets a complete chat completion for the provided messages.
    /// </summary>
    Task<string> GetChatCompletionsAsync(
        IEnumerable<ChatMessage> messages,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Get a concise title for the conversation based on its messages.
    /// </summary>
    /// <param name="messages"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<string> GetConversationTitleAsync(
        IEnumerable<ChatMessage> messages,
        CancellationToken cancellationToken = default
    );
}
