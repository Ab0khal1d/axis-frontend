namespace LinkawyGenie.Common.Contracts.Common;

/// <summary>
/// Standard API response wrapper for consistent response formatting.
/// This provides a uniform structure for all API responses with success/error handling.
/// </summary>
/// <typeparam name="T">The type of data being returned</typeparam>
public sealed record ApiResponse<T>(
    bool Success,
    T? Data = default,
    string? Message = null,
    IReadOnlyList<ValidationError>? ValidationErrors = null,
    IReadOnlyList<string>? Errors = null,
    string? TraceId = null,
    DateTimeOffset? Timestamp = null
)
{
    public static ApiResponse<T> SuccessResponse(
        T data,
        string? message = null,
        string? traceId = null
    )
    {
        return new ApiResponse<T>(
            Success: true,
            Data: data,
            Message: message,
            TraceId: traceId,
            Timestamp: DateTimeOffset.UtcNow
        );
    }

    public static ApiResponse<T> ErrorResponse(string error, string? traceId = null)
    {
        return new ApiResponse<T>(
            Success: false,
            Errors: [error],
            TraceId: traceId,
            Timestamp: DateTimeOffset.UtcNow
        );
    }

    public static ApiResponse<T> ErrorResponse(IReadOnlyList<string> errors, string? traceId = null)
    {
        return new ApiResponse<T>(
            Success: false,
            Errors: errors,
            TraceId: traceId,
            Timestamp: DateTimeOffset.UtcNow
        );
    }

    public static ApiResponse<T> ValidationErrorResponse(
        IReadOnlyList<ValidationError> validationErrors,
        string? traceId = null
    )
    {
        return new ApiResponse<T>(
            Success: false,
            ValidationErrors: validationErrors,
            TraceId: traceId,
            Timestamp: DateTimeOffset.UtcNow
        );
    }

    public static ApiResponse<T> ValidationErrorResponse(
        ValidationError validationError,
        string? traceId = null
    )
    {
        return ValidationErrorResponse([validationError], traceId);
    }
}
