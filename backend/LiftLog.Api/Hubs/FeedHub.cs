using LiftLog.Api.Db;
using LiftLog.Api.Models;
using LiftLog.Api.Service;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace LiftLog.Api.Hubs;

public interface IFeedClient
{
    Task LiveFrame(LiveFrame frame);
    Task LiveEnded(Guid userId, Guid eventId);
    Task InboxNudge();
}

public class FeedHub(
    UserDataContext db,
    PasswordService passwordService,
    LiveFeedRegistry registry,
    TimeProvider timeProvider
) : Hub<IFeedClient>
{
    public const int MaxWatchedUsers = 200;
    public const int MaxFollowSecretLength = 40;
    public const int MaxPayloadBytes = 15 * 1024;
    public const int MaxIVBytes = 16;

    private const string UserIdKey = "userId";

    public static string InboxGroup(Guid userId) => $"inbox:{userId}";

    public static string LiveGroup(Guid userId) => $"live:{userId}";

    public async Task Authenticate(Guid userId, string password)
    {
        var user = await db.Users.FindAsync(userId);
        if (
            user is null
            || string.IsNullOrEmpty(password)
            || !passwordService.VerifyPassword(password, user.HashedPassword, user.Salt)
        )
        {
            throw new HubException("Unauthorized");
        }

        if (Context.Items.TryGetValue(UserIdKey, out var previous) && previous is Guid previousId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, InboxGroup(previousId));
        }
        Context.Items[UserIdKey] = userId;
        await Groups.AddToGroupAsync(Context.ConnectionId, InboxGroup(userId));
    }

    public async Task<WatchLiveResponse> Watch(string[] followSecrets)
    {
        if (
            followSecrets.Length > MaxWatchedUsers
            || followSecrets.Any(x => string.IsNullOrEmpty(x) || x.Length > MaxFollowSecretLength)
        )
        {
            throw new HubException("Invalid follow secrets");
        }

        var watched = await db
            .UserFollowSecrets.Where(x => followSecrets.Contains(x.Value))
            .Select(x => new WatchedUser(x.Value, x.UserId))
            .ToArrayAsync();

        var stopped = registry.SetWatches(Context.ConnectionId, watched);
        foreach (var userId in stopped)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, LiveGroup(userId));
        }
        foreach (var userId in watched.Select(x => x.UserId).Distinct())
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, LiveGroup(userId));
        }

        return new WatchLiveResponse(
            registry.GetFrames(watched.Select(x => x.UserId)),
            followSecrets.Except(watched.Select(x => x.FollowSecret)).ToArray()
        );
    }

    public async Task PublishLive(Guid eventId, byte[] encryptedEventPayload, byte[] encryptedEventIV)
    {
        var userId = RequireUserId();
        if (
            encryptedEventPayload.Length is 0 or > MaxPayloadBytes
            || encryptedEventIV.Length is 0 or > MaxIVBytes
        )
        {
            throw new HubException("Invalid frame");
        }

        var frame = new LiveFrame(
            userId,
            eventId,
            encryptedEventPayload,
            encryptedEventIV,
            timeProvider.GetUtcNow()
        );
        registry.Publish(frame);
        await Clients.Group(LiveGroup(userId)).LiveFrame(frame);
    }

    public async Task EndLive(Guid eventId)
    {
        var userId = RequireUserId();
        registry.End(userId, eventId);
        await Clients.Group(LiveGroup(userId)).LiveEnded(userId, eventId);
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        registry.RemoveConnection(Context.ConnectionId);
        return base.OnDisconnectedAsync(exception);
    }

    private Guid RequireUserId() =>
        Context.Items.TryGetValue(UserIdKey, out var value) && value is Guid userId
            ? userId
            : throw new HubException("Unauthorized");
}
