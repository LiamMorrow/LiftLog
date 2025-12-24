using LiftLog.Lib.Services;

namespace LiftLog.Lib.Models;

public record CreateSharedItemRequest(
    Guid UserId,
    string Password,
    AesEncryptedAndRsaSignedData EncryptedPayload,
    DateTimeOffset Expiry
);

public record CreateSharedItemResponse(string Id);

public record GetSharedItemResponse(
    RsaPublicKey RsaPublicKey,
    AesEncryptedAndRsaSignedData EncryptedPayload
)
{
    public object Should()
    {
        throw new NotImplementedException();
    }
}
