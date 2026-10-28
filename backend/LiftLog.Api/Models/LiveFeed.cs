namespace LiftLog.Api.Models;

public record LiveFrame(
    Guid UserId,
    Guid EventId,
    byte[] EncryptedEventPayload,
    byte[] EncryptedEventIV,
    DateTimeOffset Timestamp
);

public record WatchLiveResponse(LiveFrame[] Frames, string[] InvalidFollowSecrets);

public record WatchedUser(string FollowSecret, Guid UserId);
