using LinkawyGenie.Common.Domain.Base;
using LinkawyGenie.Common.Domain.Base.Interfaces;
using LinkawyGenie.Common.Domain.Users;

namespace LinkawyGenie.Common.Domain.Authentication;

/// <summary>
/// Value object representing a user role in the system.
/// Roles define what actions a user can perform within the application.
/// This follows the principle of encapsulation by making roles immutable.
/// </summary>
public sealed class UserRole : IValueObject
{
    public const int NameMaxLength = 50;

    private UserRole(string name)
    {
        Value = name;
    }

    public string Value { get; }

    public static UserRole Create(string name)
    {
        ThrowIfNullOrWhiteSpace(name, nameof(name));
        var trimmed = name.Trim();
        ThrowIfGreaterThan(trimmed.Length, NameMaxLength, nameof(name));

        return new UserRole(trimmed);
    }

    public static UserRole Admin() => new("Admin");

    public static UserRole User() => new("User");

    public static UserRole Guest() => new("Guest");

    public bool Equals(UserRole? other) =>
        other is not null && Value.Equals(other.Value, StringComparison.OrdinalIgnoreCase);

    public override bool Equals(object? obj) => Equals(obj as UserRole);

    public override int GetHashCode() => Value.GetHashCode(StringComparison.OrdinalIgnoreCase);

    public override string ToString() => Value;
}

/// <summary>
/// Value object representing a permission that can be granted to users.
/// Permissions are fine-grained access controls for specific operations.
/// </summary>
public sealed class Permission : IValueObject
{
    public const int NameMaxLength = 100;

    private Permission(string name)
    {
        Value = name;
    }

    public string Value { get; }

    public static Permission Create(string name)
    {
        ThrowIfNullOrWhiteSpace(name, nameof(name));
        var trimmed = name.Trim();
        ThrowIfGreaterThan(trimmed.Length, NameMaxLength, nameof(name));

        return new Permission(trimmed);
    }

    // Knowledge Management Permissions
    public static Permission ManageKnowledgeBase() => new("knowledge.manage");

    public static Permission UploadDocuments() => new("documents.upload");

    public static Permission ViewDocuments() => new("documents.view");

    public static Permission DeleteDocuments() => new("documents.delete");

    // User Management Permissions
    public static Permission ManageUsers() => new("users.manage");

    public static Permission ViewUsers() => new("users.view");

    public static Permission AssignRoles() => new("roles.assign");

    // System Administration Permissions
    public static Permission ViewSystemMetrics() => new("system.metrics.view");

    public static Permission ManageSystemSettings() => new("system.settings.manage");

    // Chat Permissions
    public static Permission ChatWithAI() => new("chat.ai");

    public static Permission ViewConversations() => new("conversations.view");

    public static Permission DeleteConversations() => new("conversations.delete");

    public bool Equals(Permission? other) =>
        other is not null && Value.Equals(other.Value, StringComparison.OrdinalIgnoreCase);

    public override bool Equals(object? obj) => Equals(obj as Permission);

    public override int GetHashCode() => Value.GetHashCode(StringComparison.OrdinalIgnoreCase);

    public override string ToString() => Value;
}

/// <summary>
/// Aggregate root for managing user access control and permissions.
/// This aggregate ensures that access control rules are enforced consistently
/// and provides a single point of truth for user permissions.
/// </summary>
public sealed class AccessControl : AggregateRoot<AccessControlId>
{
    private readonly HashSet<UserRole> _roles = new();
    private readonly HashSet<Permission> _permissions = new();

    private AccessControl() { }

    public UserId UserId { get; private set; }
    public bool IsActive { get; private set; }
    public DateTimeOffset? LastAccessAt { get; private set; }
    public int FailedLoginAttempts { get; private set; }
    public DateTimeOffset? LockedUntil { get; private set; }

    public IReadOnlyCollection<UserRole> Roles => _roles;
    public IReadOnlyCollection<Permission> Permissions => _permissions;

    public static AccessControl Create(UserId userId)
    {
        var accessControl = new AccessControl
        {
            Id = AccessControlId.From(Guid.CreateVersion7()),
            UserId = userId,
            IsActive = true,
            FailedLoginAttempts = 0,
        };

        // Grant default user permissions
        accessControl.GrantPermission(Permission.ChatWithAI());
        accessControl.GrantPermission(Permission.ViewConversations());

        accessControl.AddDomainEvent(new AccessControlCreatedEvent(accessControl));
        return accessControl;
    }

    public void GrantRole(UserRole role)
    {
        ThrowIfNull(role, nameof(role));

        if (_roles.Add(role))
        {
            AddDomainEvent(new RoleGrantedEvent(this, role));
        }
    }

    public void RevokeRole(UserRole role)
    {
        ThrowIfNull(role, nameof(role));

        if (_roles.Remove(role))
        {
            AddDomainEvent(new RoleRevokedEvent(this, role));
        }
    }

    public void GrantPermission(Permission permission)
    {
        ThrowIfNull(permission, nameof(permission));

        if (_permissions.Add(permission))
        {
            AddDomainEvent(new PermissionGrantedEvent(this, permission));
        }
    }

    public void RevokePermission(Permission permission)
    {
        ThrowIfNull(permission, nameof(permission));

        if (_permissions.Remove(permission))
        {
            AddDomainEvent(new PermissionRevokedEvent(this, permission));
        }
    }

    public bool HasPermission(Permission permission)
    {
        return _permissions.Contains(permission);
    }

    public bool HasRole(UserRole role)
    {
        return _roles.Contains(role);
    }

    public bool IsAdmin()
    {
        return HasRole(UserRole.Admin());
    }

    public void RecordSuccessfulAccess(DateTimeOffset accessTime)
    {
        LastAccessAt = accessTime;
        FailedLoginAttempts = 0;
        LockedUntil = null;
    }

    public void RecordFailedAccess(DateTimeOffset accessTime)
    {
        FailedLoginAttempts++;

        // Lock account after 5 failed attempts for 30 minutes
        if (FailedLoginAttempts >= 5)
        {
            LockedUntil = accessTime.AddMinutes(30);
            AddDomainEvent(new AccountLockedEvent(this));
        }
    }

    public bool IsLocked(DateTimeOffset currentTime)
    {
        return LockedUntil.HasValue && LockedUntil.Value > currentTime;
    }

    public void Deactivate()
    {
        IsActive = false;
        AddDomainEvent(new AccessControlDeactivatedEvent(this));
    }

    public void Activate()
    {
        IsActive = true;
        FailedLoginAttempts = 0;
        LockedUntil = null;
        AddDomainEvent(new AccessControlActivatedEvent(this));
    }
}

[ValueObject<Guid>]
public readonly partial struct AccessControlId;

// Domain Events
public sealed record AccessControlCreatedEvent(AccessControl AccessControl) : IDomainEvent;

public sealed record RoleGrantedEvent(AccessControl AccessControl, UserRole Role) : IDomainEvent;

public sealed record RoleRevokedEvent(AccessControl AccessControl, UserRole Role) : IDomainEvent;

public sealed record PermissionGrantedEvent(AccessControl AccessControl, Permission Permission)
    : IDomainEvent;

public sealed record PermissionRevokedEvent(AccessControl AccessControl, Permission Permission)
    : IDomainEvent;

public sealed record AccountLockedEvent(AccessControl AccessControl) : IDomainEvent;

public sealed record AccessControlDeactivatedEvent(AccessControl AccessControl) : IDomainEvent;

public sealed record AccessControlActivatedEvent(AccessControl AccessControl) : IDomainEvent;
