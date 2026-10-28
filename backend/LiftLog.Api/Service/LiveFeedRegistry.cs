using System.Collections.Concurrent;
using LiftLog.Api.Models;

namespace LiftLog.Api.Service;

/// <summary>
/// The latest live workout frame for each user, and which users each feed hub connection watches.
/// Held in memory only: a restart forgets every frame until its trainer publishes again.
/// </summary>
public class LiveFeedRegistry(TimeProvider timeProvider)
{
    public static readonly TimeSpan FrameLifetime = TimeSpan.FromMinutes(30);

    private readonly ConcurrentDictionary<Guid, LiveFrame> frames = new();
    private readonly ConcurrentDictionary<string, WatchedUser[]> watches = new();

    public void Publish(LiveFrame frame) => frames[frame.UserId] = frame;

    public void End(Guid userId, Guid eventId)
    {
        if (frames.TryGetValue(userId, out var frame) && frame.EventId == eventId)
        {
            frames.TryRemove(KeyValuePair.Create(userId, frame));
        }
    }

    public void Evict(Guid userId) => frames.TryRemove(userId, out _);

    public LiveFrame[] GetFrames(IEnumerable<Guid> userIds) =>
        userIds
            .Distinct()
            .Select(userId => frames.TryGetValue(userId, out var frame) ? frame : null)
            .OfType<LiveFrame>()
            .Where(IsCurrent)
            .ToArray();

    public void SweepExpired()
    {
        foreach (var entry in frames.Where(entry => !IsCurrent(entry.Value)))
        {
            frames.TryRemove(entry);
        }
    }

    /// <returns>The users this connection watched before and no longer does.</returns>
    public Guid[] SetWatches(string connectionId, WatchedUser[] watched)
    {
        var previous = watches.TryGetValue(connectionId, out var existing) ? existing : [];
        watches[connectionId] = watched;
        return previous
            .Select(x => x.UserId)
            .Except(watched.Select(x => x.UserId))
            .Distinct()
            .ToArray();
    }

    public void RemoveConnection(string connectionId) => watches.TryRemove(connectionId, out _);

    /// <returns>The connections that no longer watch <paramref name="userId"/> once the secret is gone.</returns>
    public string[] Revoke(Guid userId, string followSecret)
    {
        var stopped = new List<string>();
        foreach (var (connectionId, watched) in watches)
        {
            if (!watched.Any(x => x.UserId == userId && x.FollowSecret == followSecret))
            {
                continue;
            }
            var remaining = watched
                .Where(x => !(x.UserId == userId && x.FollowSecret == followSecret))
                .ToArray();
            watches[connectionId] = remaining;
            if (remaining.All(x => x.UserId != userId))
            {
                stopped.Add(connectionId);
            }
        }
        return [.. stopped];
    }

    private bool IsCurrent(LiveFrame frame) =>
        frame.Timestamp + FrameLifetime > timeProvider.GetUtcNow();
}
