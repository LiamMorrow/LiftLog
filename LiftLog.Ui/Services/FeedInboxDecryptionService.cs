using Google.Protobuf;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using LiftLog.Ui.Models;
using LiftLog.Ui.Store.Feed;
using Microsoft.Extensions.Logging;

namespace LiftLog.Ui.Services;

public class FeedInboxDecryptionService(
    IEncryptionService encryptionService,
    IFeedApiService feedApiService,
    ILogger<FeedInboxDecryptionService> logger
)
{
    internal async Task<InboxMessageDao?> DecryptIfValid(
        FeedIdentity identity,
        GetInboxMessageResponse inboxMessage
    )
    {
        try
        {
            var decrypted = await encryptionService.DecryptRsaOaepSha256Async(
                new RsaEncryptedData(inboxMessage.EncryptedMessage),
                identity.RsaKeyPair.PrivateKey
            );
            var unverifiedInboxMessage = InboxMessageDao.Parser.ParseFrom(decrypted);

            if (
                unverifiedInboxMessage.Signature is null
                || unverifiedInboxMessage.Signature.Length == 0
            )
            {
                // Temporary until majority of users have updated to new version
                return unverifiedInboxMessage;
            }

            byte[] signedPayload = GetSignaturePayload(unverifiedInboxMessage, identity.Id);
            var publicKey = await GetUserPublicKey(unverifiedInboxMessage.FromUserId);

            var verified = await encryptionService.VerifyRsaPssSha256Async(
                signedPayload,
                unverifiedInboxMessage.Signature.ToByteArray(),
                publicKey
            );

            if (!verified)
            {
                throw new InvalidOperationException("Failed to verify inbox message signature");
            }

            return unverifiedInboxMessage;
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to decrypt inbox message");
            return null;
        }
    }

    internal static byte[] GetSignaturePayload(InboxMessageDao inboxMessage, Guid toUserId) =>
        [
            .. inboxMessage.GetPayloadBytes(),
            .. inboxMessage.FromUserId.ToByteArray(),
            .. toUserId.ToByteArray(),
        ];

    private async ValueTask<RsaPublicKey> GetUserPublicKey(Guid userId)
    {
        var userResponse = await feedApiService.GetUserAsync(userId.ToString());
        if (!userResponse.IsSuccess)
        {
            throw new InvalidOperationException("Failed to fetch user for public key");
        }
        return new RsaPublicKey(userResponse.Data.RsaPublicKey);
    }
}
