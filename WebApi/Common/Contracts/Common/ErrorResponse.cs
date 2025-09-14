namespace LinkawyGenie.Common.Contracts.Common;

/// <summary>
/// Standard error response for API failures.
/// This provides consistent error formatting across all API endpoints.
/// </summary>
public sealed record ErrorResponse(
    string Message,
    string? Code = null,
    string? Details = null,
    string? TraceId = null,
    DateTimeOffset Timestamp = default
)
{
    public static ErrorResponse Create(
        string message,
        string? code = null,
        string? details = null,
        string? traceId = null
    )
    {
        return new ErrorResponse(
            Message: message,
            Code: code,
            Details: details,
            TraceId: traceId,
            Timestamp: DateTimeOffset.UtcNow
        );
    }
}
