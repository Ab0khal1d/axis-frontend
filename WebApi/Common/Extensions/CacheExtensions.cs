using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace LinkawyGenie.Common.Extensions;

public static class CacheExtensions
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false,
    };

    public static async Task<T?> GetCachedResultAsync<T>(
        this IDistributedCache cache,
        string cacheKey,
        CancellationToken cancellationToken
    )
        where T : class
    {
        var cachedValue = await cache.GetStringAsync(cacheKey, cancellationToken);

        if (string.IsNullOrEmpty(cachedValue))
            return null;

        return JsonSerializer.Deserialize<T>(cachedValue, JsonOptions);
    }

    public static async Task CacheResultAsync<T>(
        this IDistributedCache cache,
        string cacheKey,
        T value,
        CancellationToken cancellationToken
    )
        where T : class
    {
        var serializedValue = JsonSerializer.Serialize(value, JsonOptions);

        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15),
            SlidingExpiration = TimeSpan.FromMinutes(5),
        };

        await cache.SetStringAsync(cacheKey, serializedValue, cacheOptions, cancellationToken);
    }
}
