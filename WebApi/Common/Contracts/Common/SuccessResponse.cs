namespace LinkawyGenie.Common.Contracts.Common;

/// <summary>
/// Standard success response for operations that don't return data.
/// This provides consistent success messaging across all API endpoints.
/// </summary>
public sealed record SuccessResponse(
    string Message,
    DateTimeOffset? Timestamp,
    string? TraceId = null
)
{
    public static SuccessResponse Create(string message, string? traceId = null)
    {
        return new SuccessResponse(
            Message: message,
            Timestamp: DateTimeOffset.UtcNow,
            TraceId: traceId
        );
    }
}
