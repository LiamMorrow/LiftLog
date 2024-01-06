namespace LiftLog.Lib.Models;

public record CreateUserRequest(Guid Id);

public record GetUsersRequest(Guid[] Ids);

public record DeleteUserRequest(Guid Id, string Password);

public record GetUsersResponse(Dictionary<Guid, GetUserResponse> Users);

public record CreateUserResponse(string Password);

public record PutUserDataRequest(
    Guid Id,
    string Password,
    byte[]? EncryptedCurrentPlan,
    byte[]? EncryptedProfilePicture,
    byte[]? EncryptedName,
    // The IV can be considered public, as long as the encryption key is kept secret
    byte[] EncryptionIV
);

public record GetUserResponse(
    byte[]? EncryptedCurrentPlan,
    byte[]? EncryptedProfilePicture,
    byte[]? EncryptedName,
    // The IV can be considered public, as long as the encryption key is kept secret
    byte[] EncryptionIV
);

public record PutUserEventRequest(
    Guid UserId,
    string Password,
    // This payload is encrypted with the user's private key, which we do not store
    // Its schema is defined in LiftLog.Ui/Models/UserEvent.proto - we don't reference this proto since the server doesn't need to deserialize it
    byte[] EncryptedEventPayload,
    // The IV can be considered public, as long as the encryption key is kept secret
    byte[] EncryptedEventIV,
    // A user supplied expiry time for this event, this does not ensure that the event will last this long, just that it will definitely be deleted after this time
    // We may delete the event before this time if it is not accessed for a long time
    DateTimeOffset Expiry
);

public record GetUserEventRequest(Guid UserId, string FollowSecret);

public record GetEventsRequest(GetUserEventRequest[] Users, DateTimeOffset Since);

public record UserEventResponse(
    Guid UserId,
    Guid EventId,
    DateTimeOffset Timestamp,
    // This payload is encrypted with the user's private key, which should be stored on the client which is requesting the event
    // Its schema is defined in LiftLog.Ui/Models/UserEvent.proto
    byte[] EncryptedEventPayload,
    // The IV can be considered public, as long as the encryption key is kept secret
    byte[] EncryptedEventIV,
    DateTimeOffset Expiry
);

public record GetEventsResponse(UserEventResponse[] Events);

// Encrypt with the TO user's public key, which they store on their client
// RSA has max message size of key size, so chunk if necessary
public record PutInboxMessageRequest(Guid ToUserId, byte[][] EncryptedMessage);

public record GetInboxMessagesRequest(Guid UserId, string Password);

// Encrypted with the requester's public key, which they store on their client
public record GetInboxMessageResponse(Guid Id, byte[][] EncryptedMessage);

public record GetInboxMessagesResponse(GetInboxMessageResponse[] InboxMessages);

public record PutUserFollowSecretRequest(Guid UserId, string Password, string FollowSecret);

public record DeleteUserFollowSecretRequest(Guid UserId, string Password, string FollowSecret);
