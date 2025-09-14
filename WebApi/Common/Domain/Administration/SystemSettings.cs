using LinkawyGenie.Common.Domain.Base;
using LinkawyGenie.Common.Domain.Base.Interfaces;
using LinkawyGenie.Common.Domain.Users;

namespace LinkawyGenie.Common.Domain.Administration;

/// <summary>
/// Value object representing the type of system setting.
/// This categorizes settings for better organization and validation.
/// </summary>
public sealed class SettingType : IValueObject
{
    private SettingType(string value)
    {
        Value = value;
    }

    public string Value { get; }

    public static SettingType Create(string value)
    {
        ThrowIfNullOrWhiteSpace(value, nameof(value));
        var trimmed = value.Trim().ToLowerInvariant();

        return trimmed switch
        {
            "string" => new SettingType("string"),
            "integer" => new SettingType("integer"),
            "boolean" => new SettingType("boolean"),
            "decimal" => new SettingType("decimal"),
            "json" => new SettingType("json"),
            "url" => new SettingType("url"),
            "email" => new SettingType("email"),
            _ => throw new ArgumentException($"Invalid setting type: {value}", nameof(value)),
        };
    }

    public static SettingType String() => new("string");

    public static SettingType Integer() => new("integer");

    public static SettingType Boolean() => new("boolean");

    public static SettingType Decimal() => new("decimal");

    public static SettingType Json() => new("json");

    public static SettingType Url() => new("url");

    public static SettingType Email() => new("email");

    public bool Equals(SettingType? other) =>
        other is not null && Value.Equals(other.Value, StringComparison.OrdinalIgnoreCase);

    public override bool Equals(object? obj) => Equals(obj as SettingType);

    public override int GetHashCode() => Value.GetHashCode(StringComparison.OrdinalIgnoreCase);

    public override string ToString() => Value;
}

/// <summary>
/// Value object representing the category of a system setting.
/// This groups related settings for better organization and access control.
/// </summary>
public sealed class SettingCategory : IValueObject
{
    public const int NameMaxLength = 50;

    private SettingCategory(string value)
    {
        Value = value;
    }

    public string Value { get; }

    public static SettingCategory Create(string value)
    {
        ThrowIfNullOrWhiteSpace(value, nameof(value));
        var trimmed = value.Trim();
        ThrowIfGreaterThan(trimmed.Length, NameMaxLength, nameof(value));

        return new SettingCategory(trimmed);
    }

    public static SettingCategory General() => new("General");

    public static SettingCategory Authentication() => new("Authentication");

    public static SettingCategory KnowledgeBase() => new("KnowledgeBase");

    public static SettingCategory Chat() => new("Chat");

    public static SettingCategory Streaming() => new("Streaming");

    public static SettingCategory Storage() => new("Storage");

    public static SettingCategory Monitoring() => new("Monitoring");

    public static SettingCategory Security() => new("Security");

    public bool Equals(SettingCategory? other) =>
        other is not null && Value.Equals(other.Value, StringComparison.OrdinalIgnoreCase);

    public override bool Equals(object? obj) => Equals(obj as SettingCategory);

    public override int GetHashCode() => Value.GetHashCode(StringComparison.OrdinalIgnoreCase);

    public override string ToString() => Value;
}

/// <summary>
/// Value object representing a system setting with validation and type safety.
/// This encapsulates individual configuration values with their metadata.
/// </summary>
public sealed class SystemSetting : IValueObject
{
    public const int KeyMaxLength = 100;
    public const int ValueMaxLength = 2000;
    public const int DescriptionMaxLength = 500;

    private SystemSetting(
        string key,
        string value,
        SettingType type,
        SettingCategory category,
        string description,
        bool isRequired,
        bool isEncrypted,
        string? defaultValue
    )
    {
        Key = key;
        Value = value;
        Type = type;
        Category = category;
        Description = description;
        IsRequired = isRequired;
        IsEncrypted = isEncrypted;
        DefaultValue = defaultValue;
    }

    public string Key { get; }
    public string Value { get; }
    public SettingType Type { get; }
    public SettingCategory Category { get; }
    public string Description { get; }
    public bool IsRequired { get; }
    public bool IsEncrypted { get; }
    public string? DefaultValue { get; }

    public static SystemSetting Create(
        string key,
        string value,
        SettingType type,
        SettingCategory category,
        string description,
        bool isRequired = false,
        bool isEncrypted = false,
        string? defaultValue = null
    )
    {
        ThrowIfNullOrWhiteSpace(key, nameof(key));
        ThrowIfNullOrWhiteSpace(value, nameof(value));
        ThrowIfNull(type, nameof(type));
        ThrowIfNull(category, nameof(category));
        ThrowIfNullOrWhiteSpace(description, nameof(description));

        var trimmedKey = key.Trim();
        var trimmedValue = value.Trim();
        var trimmedDescription = description.Trim();

        ThrowIfGreaterThan(trimmedKey.Length, KeyMaxLength, nameof(key));
        ThrowIfGreaterThan(trimmedValue.Length, ValueMaxLength, nameof(value));
        ThrowIfGreaterThan(trimmedDescription.Length, DescriptionMaxLength, nameof(description));

        return new SystemSetting(
            trimmedKey,
            trimmedValue,
            type,
            category,
            trimmedDescription,
            isRequired,
            isEncrypted,
            defaultValue?.Trim()
        );
    }

    public bool Equals(SystemSetting? other) =>
        other is not null
        && Key.Equals(other.Key, StringComparison.OrdinalIgnoreCase)
        && Value == other.Value
        && Type.Equals(other.Type)
        && Category.Equals(other.Category)
        && Description == other.Description
        && IsRequired == other.IsRequired
        && IsEncrypted == other.IsEncrypted
        && DefaultValue == other.DefaultValue;

    public override bool Equals(object? obj) => Equals(obj as SystemSetting);

    public override int GetHashCode() =>
        HashCode.Combine(
            Key,
            Value,
            Type,
            Category,
            Description,
            IsRequired,
            IsEncrypted,
            DefaultValue
        );

    public override string ToString() => $"{Key}: {Value} ({Type})";
}

/// <summary>
/// Aggregate root representing system configuration and settings.
/// This aggregate manages all system-wide configuration values and ensures
/// they are properly validated and accessible throughout the application.
/// </summary>
public sealed class SystemSettings : AggregateRoot<SystemSettingsId>
{
    private readonly Dictionary<string, SystemSetting> _settings = new(
        StringComparer.OrdinalIgnoreCase
    );

    private SystemSettings() { }

    public string Name { get; private set; } = null!;
    public string Description { get; private set; } = null!;
    public UserId CreatedBy { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset LastUpdatedAt { get; private set; }
    public UserId? LastUpdatedBy { get; private set; }
    public int SettingCount { get; private set; }
    public bool IsActive { get; private set; }

    public IReadOnlyDictionary<string, SystemSetting> Settings => _settings.AsReadOnly();

    public static SystemSettings Create(string name, string description, UserId createdBy)
    {
        ThrowIfNullOrWhiteSpace(name, nameof(name));
        ThrowIfNullOrWhiteSpace(description, nameof(description));
        ThrowIfNull(createdBy, nameof(createdBy));

        var settings = new SystemSettings
        {
            Id = SystemSettingsId.From(Guid.CreateVersion7()),
            Name = name.Trim(),
            Description = description.Trim(),
            CreatedBy = createdBy,
            CreatedAt = DateTimeOffset.UtcNow,
            LastUpdatedAt = DateTimeOffset.UtcNow,
            SettingCount = 0,
            IsActive = true,
        };

        settings.AddDomainEvent(new SystemSettingsCreatedEvent(settings));
        return settings;
    }

    public void AddSetting(SystemSetting setting)
    {
        ThrowIfNull(setting, nameof(setting));

        if (!IsActive)
            throw new InvalidOperationException("Cannot add settings to inactive configuration");

        _settings[setting.Key] = setting;
        SettingCount = _settings.Count;
        LastUpdatedAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new SystemSettingAddedEvent(this, setting));
    }

    public void UpdateSetting(string key, string newValue, UserId updatedBy)
    {
        ThrowIfNullOrWhiteSpace(key, nameof(key));
        ThrowIfNullOrWhiteSpace(newValue, nameof(newValue));
        ThrowIfNull(updatedBy, nameof(updatedBy));

        if (!_settings.TryGetValue(key, out var existingSetting))
            throw new InvalidOperationException($"Setting '{key}' not found");

        var updatedSetting = SystemSetting.Create(
            existingSetting.Key,
            newValue,
            existingSetting.Type,
            existingSetting.Category,
            existingSetting.Description,
            existingSetting.IsRequired,
            existingSetting.IsEncrypted,
            existingSetting.DefaultValue
        );

        _settings[key] = updatedSetting;
        LastUpdatedAt = DateTimeOffset.UtcNow;
        LastUpdatedBy = updatedBy;

        AddDomainEvent(new SystemSettingUpdatedEvent(this, existingSetting, updatedSetting));
    }

    public void RemoveSetting(string key, UserId removedBy)
    {
        ThrowIfNullOrWhiteSpace(key, nameof(key));
        ThrowIfNull(removedBy, nameof(removedBy));

        if (!_settings.TryGetValue(key, out var setting))
            return;

        if (setting.IsRequired)
            throw new InvalidOperationException($"Cannot remove required setting '{key}'");

        _settings.Remove(key);
        SettingCount = _settings.Count;
        LastUpdatedAt = DateTimeOffset.UtcNow;
        LastUpdatedBy = removedBy;

        AddDomainEvent(new SystemSettingRemovedEvent(this, setting));
    }

    public SystemSetting? GetSetting(string key)
    {
        ThrowIfNullOrWhiteSpace(key, nameof(key));
        return _settings.TryGetValue(key, out var setting) ? setting : null;
    }

    public string GetSettingValue(string key, string? defaultValue = null)
    {
        var setting = GetSetting(key);
        return setting?.Value
            ?? defaultValue
            ?? throw new InvalidOperationException(
                $"Setting '{key}' not found and no default value provided"
            );
    }

    public T GetSettingValue<T>(string key, T? defaultValue = default)
    {
        var value = GetSettingValue(key, defaultValue?.ToString());

        try
        {
            return (T)Convert.ChangeType(value, typeof(T));
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                $"Cannot convert setting '{key}' value '{value}' to type {typeof(T).Name}",
                ex
            );
        }
    }

    public IEnumerable<SystemSetting> GetSettingsByCategory(SettingCategory category)
    {
        return _settings.Values.Where(s => s.Category.Equals(category));
    }

    public IEnumerable<SystemSetting> GetRequiredSettings()
    {
        return _settings.Values.Where(s => s.IsRequired);
    }

    public IEnumerable<SystemSetting> GetEncryptedSettings()
    {
        return _settings.Values.Where(s => s.IsEncrypted);
    }

    public bool HasSetting(string key)
    {
        return _settings.ContainsKey(key);
    }

    public void UpdateName(string newName)
    {
        ThrowIfNullOrWhiteSpace(newName, nameof(newName));

        Name = newName.Trim();
        LastUpdatedAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new SystemSettingsNameUpdatedEvent(this));
    }

    public void UpdateDescription(string newDescription)
    {
        ThrowIfNullOrWhiteSpace(newDescription, nameof(newDescription));

        Description = newDescription.Trim();
        LastUpdatedAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new SystemSettingsDescriptionUpdatedEvent(this));
    }

    public void Deactivate()
    {
        IsActive = false;
        LastUpdatedAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new SystemSettingsDeactivatedEvent(this));
    }

    public void Activate()
    {
        IsActive = true;
        LastUpdatedAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new SystemSettingsActivatedEvent(this));
    }

    public bool HasRequiredSettings => _settings.Values.Any(s => s.IsRequired);
    public bool HasEncryptedSettings => _settings.Values.Any(s => s.IsEncrypted);
}

[ValueObject<Guid>]
public readonly partial struct SystemSettingsId;

// Domain Events
public sealed record SystemSettingsCreatedEvent(SystemSettings SystemSettings) : IDomainEvent;

public sealed record SystemSettingAddedEvent(SystemSettings SystemSettings, SystemSetting Setting)
    : IDomainEvent;

public sealed record SystemSettingUpdatedEvent(
    SystemSettings SystemSettings,
    SystemSetting OldSetting,
    SystemSetting NewSetting
) : IDomainEvent;

public sealed record SystemSettingRemovedEvent(SystemSettings SystemSettings, SystemSetting Setting)
    : IDomainEvent;

public sealed record SystemSettingsNameUpdatedEvent(SystemSettings SystemSettings) : IDomainEvent;

public sealed record SystemSettingsDescriptionUpdatedEvent(SystemSettings SystemSettings)
    : IDomainEvent;

public sealed record SystemSettingsDeactivatedEvent(SystemSettings SystemSettings) : IDomainEvent;

public sealed record SystemSettingsActivatedEvent(SystemSettings SystemSettings) : IDomainEvent;
