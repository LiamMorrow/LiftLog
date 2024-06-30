using LiftLog.Lib.Services;

namespace LiftLog.Lib.Models;

public record CreateSharedItemRequest(
    Guid UserId,
    string Password,
    byte[] EncryptedPayload,
    byte[] EncryptionIV,
    DateTimeOffset Expiry
);

public record CreateSharedItemResponse(string Id);

public record GetSharedItemResponse(
    RsaPublicKey RsaPublicKey,
    byte[] EncryptedPayload,
    byte[] EncryptionIV
);
