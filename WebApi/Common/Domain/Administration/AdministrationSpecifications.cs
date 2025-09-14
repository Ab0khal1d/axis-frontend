using LinkawyGenie.Common.Domain.Users;

namespace LinkawyGenie.Common.Domain.Administration;

/// <summary>
/// Specification for retrieving usage metrics by ID.
/// This provides a base query for specific usage metrics collections.
/// </summary>
public sealed class UsageMetricsByIdSpec : SingleResultSpecification<UsageMetrics>
{
    public UsageMetricsByIdSpec(UsageMetricsId usageMetricsId)
    {
        Query.Where(um => um.Id == usageMetricsId);
    }
}

/// <summary>
/// Specification for retrieving active usage metrics.
/// This filters usage metrics collections that are currently active.
/// </summary>
public sealed class ActiveUsageMetricsSpec : Specification<UsageMetrics>
{
    public ActiveUsageMetricsSpec()
    {
        Query.Where(um => um.IsActive);
    }
}

/// <summary>
/// Specification for retrieving usage metrics with pagination and ordering.
/// This includes proper ordering by creation date for usage metrics lists.
/// </summary>
public sealed class UsageMetricsWithPaginationSpec : Specification<UsageMetrics>
{
    public UsageMetricsWithPaginationSpec()
    {
        Query.OrderByDescending(um => um.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving usage metrics by name.
/// This enables filtering usage metrics by their name.
/// </summary>
public sealed class UsageMetricsByNameSpec : Specification<UsageMetrics>
{
    public UsageMetricsByNameSpec(string name)
    {
        Query.Where(um => um.Name.Contains(name)).OrderByDescending(um => um.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving usage metrics created within a date range.
/// This enables filtering usage metrics by creation date.
/// </summary>
public sealed class UsageMetricsByDateRangeSpec : Specification<UsageMetrics>
{
    public UsageMetricsByDateRangeSpec(DateTimeOffset fromDate, DateTimeOffset toDate)
    {
        Query
            .Where(um => um.CreatedAt >= fromDate && um.CreatedAt <= toDate)
            .OrderByDescending(um => um.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving system settings by ID.
/// This provides a base query for specific system settings collections.
/// </summary>
public sealed class SystemSettingsByIdSpec : SingleResultSpecification<SystemSettings>
{
    public SystemSettingsByIdSpec(SystemSettingsId systemSettingsId)
    {
        Query.Where(ss => ss.Id == systemSettingsId);
    }
}

/// <summary>
/// Specification for retrieving active system settings.
/// This filters system settings collections that are currently active.
/// </summary>
public sealed class ActiveSystemSettingsSpec : Specification<SystemSettings>
{
    public ActiveSystemSettingsSpec()
    {
        Query.Where(ss => ss.IsActive);
    }
}

/// <summary>
/// Specification for retrieving system settings with pagination and ordering.
/// This includes proper ordering by creation date for system settings lists.
/// </summary>
public sealed class SystemSettingsWithPaginationSpec : Specification<SystemSettings>
{
    public SystemSettingsWithPaginationSpec()
    {
        Query.OrderByDescending(ss => ss.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving system settings by creator.
/// This provides a base query for user-specific system settings.
/// </summary>
public sealed class SystemSettingsByCreatorSpec : Specification<SystemSettings>
{
    public SystemSettingsByCreatorSpec(UserId createdBy)
    {
        Query.Where(ss => ss.CreatedBy == createdBy).OrderByDescending(ss => ss.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving system settings by name.
/// This enables filtering system settings by their name.
/// </summary>
public sealed class SystemSettingsByNameSpec : Specification<SystemSettings>
{
    public SystemSettingsByNameSpec(string name)
    {
        Query.Where(ss => ss.Name.Contains(name)).OrderByDescending(ss => ss.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving system settings created within a date range.
/// This enables filtering system settings by creation date.
/// </summary>
public sealed class SystemSettingsByDateRangeSpec : Specification<SystemSettings>
{
    public SystemSettingsByDateRangeSpec(DateTimeOffset fromDate, DateTimeOffset toDate)
    {
        Query
            .Where(ss => ss.CreatedAt >= fromDate && ss.CreatedAt <= toDate)
            .OrderByDescending(ss => ss.CreatedAt);
    }
}

/// <summary>
/// Specification for retrieving system settings with recent updates.
/// This filters system settings that have been updated within a specified time period.
/// </summary>
public sealed class SystemSettingsWithRecentUpdatesSpec : Specification<SystemSettings>
{
    public SystemSettingsWithRecentUpdatesSpec(DateTimeOffset since)
    {
        Query.Where(ss => ss.LastUpdatedAt >= since).OrderByDescending(ss => ss.LastUpdatedAt);
    }
}

/// <summary>
/// Specification for retrieving system settings by last updater.
/// This enables filtering system settings by who last updated them.
/// </summary>
public sealed class SystemSettingsByLastUpdaterSpec : Specification<SystemSettings>
{
    public SystemSettingsByLastUpdaterSpec(UserId lastUpdatedBy)
    {
        Query
            .Where(ss => ss.LastUpdatedBy == lastUpdatedBy)
            .OrderByDescending(ss => ss.LastUpdatedAt);
    }
}
