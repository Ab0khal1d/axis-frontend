//using LinkawyGenie.Common.Domain.Base;
//using LinkawyGenie.Common.Domain.Base.Interfaces;

//namespace LinkawyGenie.Common.Domain.Users;

//[ValueObject<Guid>]
//public readonly partial struct UserSessionId;

//public sealed class UserSession : Entity<UserSessionId>
//{
//    private string _accessTokenHash = null!;
//    private string? _refreshToken;
//    private string? _deviceInfo;
//    private string? _ipAddress;

//    private UserSession() { }

//    public UserId UserId { get; private set; }
//    public string AccessTokenHash
//    {
//        get => _accessTokenHash;
//        set
//        {
//            ThrowIfNullOrWhiteSpace(value, nameof(AccessTokenHash));
//            _accessTokenHash = value;
//        }
//    }
//    public string? RefreshToken
//    {
//        get => _refreshToken;
//        set => _refreshToken = value;
//    }
//    public string? DeviceInfo
//    {
//        get => _deviceInfo;
//        set => _deviceInfo = value;
//    }
//    public string? IpAddress
//    {
//        get => _ipAddress;
//        set => _ipAddress = value;
//    }
//    public DateTimeOffset ExpiresAt { get; private set; }
//    public DateTimeOffset CreatedAt { get; private set; }
//    public DateTimeOffset LastActivityAt { get; private set; }
//    public bool IsActive { get; private set; }

//    public static UserSession Create(
//        UserId userId,
//        string accessTokenHash,
//        string? refreshToken = null,
//        string? deviceInfo = null,
//        string? ipAddress = null,
//        DateTimeOffset? expiresAt = null
//    )
//    {
//        ThrowIfNull(userId, nameof(userId));
//        ThrowIfNullOrWhiteSpace(accessTokenHash, nameof(accessTokenHash));

//        var session = new UserSession
//        {
//            Id = UserSessionId.From(Guid.CreateVersion7()),
//            UserId = userId,
//            AccessTokenHash = accessTokenHash,
//            RefreshToken = refreshToken,
//            DeviceInfo = deviceInfo,
//            IpAddress = ipAddress,
//            ExpiresAt = expiresAt ?? DateTimeOffset.UtcNow.AddDays(7),
//            CreatedAt = DateTimeOffset.UtcNow,
//            LastActivityAt = DateTimeOffset.UtcNow,
//            IsActive = true,
//        };

//        return session;
//    }

//    public void UpdateActivity()
//    {
//        LastActivityAt = DateTimeOffset.UtcNow;
//    }

//    public void Deactivate()
//    {
//        IsActive = false;
//    }

//    public void Extend(TimeSpan duration)
//    {
//        ExpiresAt = DateTimeOffset.UtcNow.Add(duration);
//        UpdateActivity();
//    }

//    public void UpdateRefreshToken(string refreshToken)
//    {
//        ThrowIfNullOrWhiteSpace(refreshToken, nameof(refreshToken));
//        RefreshToken = refreshToken;
//        UpdateActivity();
//    }

//    public bool IsExpired() => DateTimeOffset.UtcNow > ExpiresAt;

//    public bool IsValid() => IsActive && !IsExpired();
//}
