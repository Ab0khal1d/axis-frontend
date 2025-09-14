using LinkawyGenie.Common.Domain.Base;
using LinkawyGenie.Common.Domain.Base.Interfaces;

namespace LinkawyGenie.Common.Domain.Users;

[ValueObject<Guid>]
public readonly partial struct UserId;

public sealed class User : AggregateRoot<UserId>
{
    private readonly HashSet<string> _roles = new(StringComparer.OrdinalIgnoreCase);

    private string _displayName = null!;
    private string _email = null!;
    private string _identityProvider = null!;

    private User() { }

    public string DisplayName
    {
        get => _displayName;
        set
        {
            ThrowIfNullOrWhiteSpace(value, nameof(DisplayName));
            _displayName = value.Trim();
        }
    }

    public string Email
    {
        get => _email;
        set
        {
            ThrowIfNullOrWhiteSpace(value, nameof(Email));
            _email = value.Trim();
        }
    }

    public string IdentityProvider
    {
        get => _identityProvider;
        set
        {
            ThrowIfNullOrWhiteSpace(value, nameof(IdentityProvider));
            _identityProvider = value.Trim();
        }
    }

    public bool IsAdmin { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? LastLoginAt { get; private set; }
    public bool IsActive { get; private set; }

    public IReadOnlyCollection<string> Roles => _roles;

    public static User Register(
        string displayName,
        string email,
        string identityProvider = "entra_id",
        bool isAdmin = false
    )
    {
        var user = new User
        {
            Id = UserId.From(Guid.CreateVersion7()),
            DisplayName = displayName,
            Email = email,
            IdentityProvider = identityProvider,
            IsAdmin = isAdmin,
            CreatedAt = DateTimeOffset.UtcNow,
            LastLoginAt = null,
            IsActive = true,
        };

        user.AddDomainEvent(new UserRegisteredEvent(user));
        return user;
    }

    public void GrantRole(string role)
    {
        ThrowIfNullOrWhiteSpace(role, nameof(role));
        if (_roles.Add(role))
            AddDomainEvent(new AdminRoleAssignedEvent(this, role));
    }

    public void SetAdminStatus(bool isAdmin)
    {
        if (IsAdmin == isAdmin)
            return;

        IsAdmin = isAdmin;

        if (isAdmin)
            AddDomainEvent(new UserPromotedToAdminEvent(this));
        else
            AddDomainEvent(new UserDemotedFromAdminEvent(this));
    }

    public void RecordLogin()
    {
        LastLoginAt = DateTimeOffset.UtcNow;
        AddDomainEvent(new UserLoggedInEvent(this));
    }

    public void Deactivate()
    {
        if (!IsActive)
            return;

        IsActive = false;
        AddDomainEvent(new UserDeactivatedEvent(this));
    }

    public void Activate()
    {
        if (IsActive)
            return;

        IsActive = true;
        AddDomainEvent(new UserActivatedEvent(this));
    }
}

public sealed record UserRegisteredEvent(User User) : IDomainEvent;

public sealed record AdminRoleAssignedEvent(User User, string Role) : IDomainEvent;

public sealed record UserPromotedToAdminEvent(User User) : IDomainEvent;

public sealed record UserDemotedFromAdminEvent(User User) : IDomainEvent;

public sealed record UserLoggedInEvent(User User) : IDomainEvent;

public sealed record UserDeactivatedEvent(User User) : IDomainEvent;

public sealed record UserActivatedEvent(User User) : IDomainEvent;


