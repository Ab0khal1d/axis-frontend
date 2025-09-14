using LinkawyGenie.Common.Domain.Base;
using LinkawyGenie.Common.Domain.Base.Interfaces;
using LinkawyGenie.Common.Domain.Users;

namespace LinkawyGenie.Common.Domain.Administration;

/// <summary>
/// Value object representing a time period for metrics aggregation.
/// This provides type-safe time period handling for analytics.
/// </summary>
public sealed class TimePeriod : IValueObject
{
    private TimePeriod(string value)
    {
        Value = value;
    }

    public string Value { get; }

    public static TimePeriod Create(string value)
    {
        ThrowIfNullOrWhiteSpace(value, nameof(value));
        var trimmed = value.Trim().ToLowerInvariant();

        return trimmed switch
        {
            "hour" => new TimePeriod("hour"),
            "day" => new TimePeriod("day"),
            "week" => new TimePeriod("week"),
            "month" => new TimePeriod("month"),
            "quarter" => new TimePeriod("quarter"),
            "year" => new TimePeriod("year"),
            _ => throw new ArgumentException($"Invalid time period: {value}", nameof(value)),
        };
    }

    public static TimePeriod Hour() => new("hour");

    public static TimePeriod Day() => new("day");

    public static TimePeriod Week() => new("week");

    public static TimePeriod Month() => new("month");

    public static TimePeriod Quarter() => new("quarter");

    public static TimePeriod Year() => new("year");

    public TimeSpan ToTimeSpan()
    {
        return Value switch
        {
            "hour" => TimeSpan.FromHours(1),
            "day" => TimeSpan.FromDays(1),
            "week" => TimeSpan.FromDays(7),
            "month" => TimeSpan.FromDays(30),
            "quarter" => TimeSpan.FromDays(90),
            "year" => TimeSpan.FromDays(365),
            _ => throw new InvalidOperationException($"Cannot convert {Value} to TimeSpan"),
        };
    }

    public bool Equals(TimePeriod? other) =>
        other is not null && Value.Equals(other.Value, StringComparison.OrdinalIgnoreCase);

    public override bool Equals(object? obj) => Equals(obj as TimePeriod);

    public override int GetHashCode() => Value.GetHashCode(StringComparison.OrdinalIgnoreCase);

    public override string ToString() => Value;
}

/// <summary>
/// Value object representing metrics for a specific time period.
/// This encapsulates aggregated usage data for analysis and reporting.
/// </summary>
public sealed class MetricsSnapshot : IValueObject
{
    private MetricsSnapshot(
        DateTimeOffset timestamp,
        TimePeriod period,
        int totalUsers,
        int activeUsers,
        int totalConversations,
        int totalMessages,
        int totalDocuments,
        long totalStorageBytes,
        double averageResponseTime,
        int apiCalls,
        decimal estimatedCost
    )
    {
        Timestamp = timestamp;
        Period = period;
        TotalUsers = totalUsers;
        ActiveUsers = activeUsers;
        TotalConversations = totalConversations;
        TotalMessages = totalMessages;
        TotalDocuments = totalDocuments;
        TotalStorageBytes = totalStorageBytes;
        AverageResponseTime = averageResponseTime;
        ApiCalls = apiCalls;
        EstimatedCost = estimatedCost;
    }

    public DateTimeOffset Timestamp { get; }
    public TimePeriod Period { get; }
    public int TotalUsers { get; }
    public int ActiveUsers { get; }
    public int TotalConversations { get; }
    public int TotalMessages { get; }
    public int TotalDocuments { get; }
    public long TotalStorageBytes { get; }
    public double AverageResponseTime { get; }
    public int ApiCalls { get; }
    public decimal EstimatedCost { get; }

    public static MetricsSnapshot Create(
        DateTimeOffset timestamp,
        TimePeriod period,
        int totalUsers,
        int activeUsers,
        int totalConversations,
        int totalMessages,
        int totalDocuments,
        long totalStorageBytes,
        double averageResponseTime,
        int apiCalls,
        decimal estimatedCost
    )
    {
        ThrowIfNull(timestamp, nameof(timestamp));
        ThrowIfNull(period, nameof(period));
        ThrowIfLessThan(totalUsers, 0, nameof(totalUsers));
        ThrowIfLessThan(activeUsers, 0, nameof(activeUsers));
        ThrowIfLessThan(totalConversations, 0, nameof(totalConversations));
        ThrowIfLessThan(totalMessages, 0, nameof(totalMessages));
        ThrowIfLessThan(totalDocuments, 0, nameof(totalDocuments));
        ThrowIfLessThan(totalStorageBytes, 0, nameof(totalStorageBytes));
        ThrowIfLessThan(averageResponseTime, 0, nameof(averageResponseTime));
        ThrowIfLessThan(apiCalls, 0, nameof(apiCalls));
        ThrowIfLessThan(estimatedCost, 0, nameof(estimatedCost));

        return new MetricsSnapshot(
            timestamp,
            period,
            totalUsers,
            activeUsers,
            totalConversations,
            totalMessages,
            totalDocuments,
            totalStorageBytes,
            averageResponseTime,
            apiCalls,
            estimatedCost
        );
    }

    public double GetUserEngagementRate()
    {
        return TotalUsers > 0 ? (double)ActiveUsers / TotalUsers : 0;
    }

    public double GetAverageMessagesPerConversation()
    {
        return TotalConversations > 0 ? (double)TotalMessages / TotalConversations : 0;
    }

    public double GetStorageUsageInMB()
    {
        return TotalStorageBytes / (1024.0 * 1024.0);
    }

    public bool Equals(MetricsSnapshot? other) =>
        other is not null
        && Timestamp == other.Timestamp
        && Period.Equals(other.Period)
        && TotalUsers == other.TotalUsers
        && ActiveUsers == other.ActiveUsers
        && TotalConversations == other.TotalConversations
        && TotalMessages == other.TotalMessages
        && TotalDocuments == other.TotalDocuments
        && TotalStorageBytes == other.TotalStorageBytes
        && Math.Abs(AverageResponseTime - other.AverageResponseTime) < 0.001
        && ApiCalls == other.ApiCalls
        && EstimatedCost == other.EstimatedCost;

    public override bool Equals(object? obj) => Equals(obj as MetricsSnapshot);

    public override int GetHashCode() =>
        HashCode.Combine(
            Timestamp,
            Period,
            TotalUsers,
            ActiveUsers,
            TotalConversations,
            TotalMessages,
            TotalDocuments,
            AverageResponseTime
        );

    public override string ToString() =>
        $"{Period} snapshot at {Timestamp:yyyy-MM-dd HH:mm}: {ActiveUsers}/{TotalUsers} users, {TotalMessages} messages";
}

/// <summary>
/// Aggregate root representing system usage metrics and analytics.
/// This aggregate collects, stores, and provides access to usage statistics
/// for monitoring, billing, and optimization purposes.
/// </summary>
public sealed class UsageMetrics : AggregateRoot<UsageMetricsId>
{
    private readonly List<MetricsSnapshot> _snapshots = [];

    private UsageMetrics() { }

    public string Name { get; private set; } = null!;
    public string Description { get; private set; } = null!;
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset LastUpdatedAt { get; private set; }
    public TimePeriod DefaultPeriod { get; private set; } = null!;
    public bool IsActive { get; private set; }
    public int SnapshotCount { get; private set; }

    public IReadOnlyList<MetricsSnapshot> Snapshots => _snapshots.AsReadOnly();

    public static UsageMetrics Create(
        string name,
        string description,
        TimePeriod? defaultPeriod = null
    )
    {
        ThrowIfNullOrWhiteSpace(name, nameof(name));
        ThrowIfNullOrWhiteSpace(description, nameof(description));

        var metrics = new UsageMetrics
        {
            Id = UsageMetricsId.From(Guid.CreateVersion7()),
            Name = name.Trim(),
            Description = description.Trim(),
            CreatedAt = DateTimeOffset.UtcNow,
            LastUpdatedAt = DateTimeOffset.UtcNow,
            DefaultPeriod = defaultPeriod ?? TimePeriod.Day(),
            IsActive = true,
            SnapshotCount = 0,
        };

        metrics.AddDomainEvent(new UsageMetricsCreatedEvent(metrics));
        return metrics;
    }

    public void AddSnapshot(MetricsSnapshot snapshot)
    {
        ThrowIfNull(snapshot, nameof(snapshot));

        if (!IsActive)
            throw new InvalidOperationException(
                "Cannot add snapshots to inactive metrics collection"
            );

        _snapshots.Add(snapshot);
        SnapshotCount = _snapshots.Count;
        LastUpdatedAt = DateTimeOffset.UtcNow;

        // Keep only last 1000 snapshots to prevent unbounded growth
        if (_snapshots.Count > 1000)
        {
            _snapshots.RemoveAt(0);
            SnapshotCount = _snapshots.Count;
        }

        AddDomainEvent(new MetricsSnapshotAddedEvent(this, snapshot));
    }

    public void UpdateDefaultPeriod(TimePeriod newPeriod)
    {
        ThrowIfNull(newPeriod, nameof(newPeriod));

        DefaultPeriod = newPeriod;
        LastUpdatedAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new UsageMetricsPeriodUpdatedEvent(this));
    }

    public void UpdateName(string newName)
    {
        ThrowIfNullOrWhiteSpace(newName, nameof(newName));

        Name = newName.Trim();
        LastUpdatedAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new UsageMetricsNameUpdatedEvent(this));
    }

    public void UpdateDescription(string newDescription)
    {
        ThrowIfNullOrWhiteSpace(newDescription, nameof(newDescription));

        Description = newDescription.Trim();
        LastUpdatedAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new UsageMetricsDescriptionUpdatedEvent(this));
    }

    public void Deactivate()
    {
        IsActive = false;
        LastUpdatedAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new UsageMetricsDeactivatedEvent(this));
    }

    public void Activate()
    {
        IsActive = true;
        LastUpdatedAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new UsageMetricsActivatedEvent(this));
    }

    public IEnumerable<MetricsSnapshot> GetSnapshotsForPeriod(TimePeriod period)
    {
        return _snapshots.Where(s => s.Period.Equals(period));
    }

    public IEnumerable<MetricsSnapshot> GetSnapshotsInDateRange(
        DateTimeOffset from,
        DateTimeOffset to
    )
    {
        return _snapshots.Where(s => s.Timestamp >= from && s.Timestamp <= to);
    }

    public MetricsSnapshot? GetLatestSnapshot()
    {
        return _snapshots.OrderByDescending(s => s.Timestamp).FirstOrDefault();
    }

    public MetricsSnapshot? GetLatestSnapshotForPeriod(TimePeriod period)
    {
        return _snapshots
            .Where(s => s.Period.Equals(period))
            .OrderByDescending(s => s.Timestamp)
            .FirstOrDefault();
    }

    public double GetAverageUserEngagement(TimePeriod period)
    {
        var snapshots = GetSnapshotsForPeriod(period);
        return snapshots.Any() ? snapshots.Average(s => s.GetUserEngagementRate()) : 0;
    }

    public double GetAverageResponseTime(TimePeriod period)
    {
        var snapshots = GetSnapshotsForPeriod(period);
        return snapshots.Any() ? snapshots.Average(s => s.AverageResponseTime) : 0;
    }

    public decimal GetTotalEstimatedCost(TimePeriod period)
    {
        var snapshots = GetSnapshotsForPeriod(period);
        return snapshots.Sum(s => s.EstimatedCost);
    }

    public bool HasSnapshots => _snapshots.Count > 0;
}

[ValueObject<Guid>]
public readonly partial struct UsageMetricsId;

// Domain Events
public sealed record UsageMetricsCreatedEvent(UsageMetrics UsageMetrics) : IDomainEvent;

public sealed record MetricsSnapshotAddedEvent(UsageMetrics UsageMetrics, MetricsSnapshot Snapshot)
    : IDomainEvent;

public sealed record UsageMetricsPeriodUpdatedEvent(UsageMetrics UsageMetrics) : IDomainEvent;

public sealed record UsageMetricsNameUpdatedEvent(UsageMetrics UsageMetrics) : IDomainEvent;

public sealed record UsageMetricsDescriptionUpdatedEvent(UsageMetrics UsageMetrics) : IDomainEvent;

public sealed record UsageMetricsDeactivatedEvent(UsageMetrics UsageMetrics) : IDomainEvent;

public sealed record UsageMetricsActivatedEvent(UsageMetrics UsageMetrics) : IDomainEvent;
