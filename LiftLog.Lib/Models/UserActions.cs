namespace LiftLog.Lib.Models;

public record CreateUserRequest(Guid Id);

public record CreateUserResponse(string Password);

public record PutUserDataRequest(
    Guid Id,
    string Password,
    byte[] EncryptedCurrentPlan,
    byte[] EncryptedProfilePicture,
    byte[] EncryptedName
);

public record GetUserResponse(
    byte[]? EncryptedCurrentPlan,
    byte[]? EncryptedProfilePicture,
    byte[]? EncryptedName
);

public record PutUserEventRequest(
    Guid UserId,
    string Password,
    // This payload is encrypted with the user's private key, which we do not store
    // Its schema is defined in LiftLog.Ui/Models/UserEvent.proto - we don't reference this proto since the server doesn't need to deserialize it
    byte[] EncryptedEventPayload,
    // A user supplied expiry time for this event, this does not ensure that the event will last this long, just that it will definitely be deleted after this time
    // We may delete the event before this time if it is not accessed for a long time
    DateTimeOffset Expiry
);

public record GetEventsRequest(Guid[] UserIds, DateTimeOffset Since);

public record UserEventResponse(
    Guid UserId,
    Guid EventId,
    DateTimeOffset Timestamp,
    // This payload is encrypted with the user's private key, which should be stored on the client which is requesting the event
    // Its schema is defined in LiftLog.Ui/Models/UserEvent.proto
    byte[] EncryptedEventPayload,
    DateTimeOffset Expiry
);

public record GetEventsResponse(UserEventResponse[] Events);
