namespace LinkawyGenie.Common.Contracts.Common;

/// <summary>
/// Validation error details for API responses.
/// This provides structured information about validation failures.
/// </summary>
public sealed record ValidationError(
    string Field,
    string Message,
    string? Code = null,
    object? AttemptedValue = null
);
