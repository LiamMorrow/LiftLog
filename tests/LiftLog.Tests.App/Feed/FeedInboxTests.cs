using Google.Protobuf;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using LiftLog.Ui.Models;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.Feed;
using Microsoft.Extensions.Logging;

namespace LiftLog.Tests.App.Feed;

record UserAndPrivateKey(FeedUser User, FeedIdentity Identity, RsaPrivateKey PrivateKey);

public class FeedInboxTests
{
  [Describe("FeedInboxTests")]
  public void Spec()
  {
    Describe("Malicious message protection")
      .As(() =>
      {
        FeedInboxDecryptionService sut = default!;
        var encryptionService = new OsEncryptionService();
        var feedApiService = Substitute.For<IFeedApiService>();
        UserAndPrivateKey maliciousUser = default;
        UserAndPrivateKey victimUser = default;
        UserAndPrivateKey thirdPartyUser = default;

        BeforeEach(
          async (i) =>
          {
            sut = new FeedInboxDecryptionService(
              encryptionService,
              feedApiService,
              Substitute.For<ILogger<FeedInboxDecryptionService>>()
            );
            maliciousUser = await CreateFeedUser();
            victimUser = await CreateFeedUser();
            thirdPartyUser = await CreateFeedUser();

            feedApiService
              .GetUserAsync(thirdPartyUser.User.Id.ToString())
              .Returns(ApiResult.Success(ToGetUserResponse(thirdPartyUser)));

            feedApiService
              .GetUserAsync(maliciousUser.User.Id.ToString())
              .Returns(ApiResult.Success(ToGetUserResponse(maliciousUser)));
          }
        );

        It(
          "should not allow a malicious user to send a follow request to a victim user to try follow the third party user",
          async () =>
          {
            var maliciousMessage = new InboxMessageDao
            {
              FromUserId = thirdPartyUser.User.Id,
              FollowRequest = new FollowRequestDao { Name = maliciousUser.User.Name },
            };
            maliciousMessage.Signature = ByteString.CopyFrom(
              await encryptionService.SignRsaPssSha256Async(
                FeedInboxDecryptionService.GetSignaturePayload(
                  maliciousMessage,
                  victimUser.User.Id
                ),
                maliciousUser.PrivateKey
              )
            );

            var encryptedMaliciousMessage = await encryptionService.EncryptRsaOaepSha256Async(
              maliciousMessage.ToByteArray(),
              victimUser.User.PublicKey
            );

            var decryptedMaliciousMessage = await sut.DecryptIfValid(
              victimUser.Identity,
              new GetInboxMessageResponse(Guid.Empty, encryptedMaliciousMessage.DataChunks)
            );

            decryptedMaliciousMessage
              .Should()
              .BeNull(
                "Because the signature of the message is not valid for a message to a subject"
              );
          }
        );

        It(
          "Should allow a valid message to be decrypted",
          async () =>
          {
            var validMessage = new InboxMessageDao
            {
              FromUserId = thirdPartyUser.User.Id,
              FollowRequest = new FollowRequestDao { Name = maliciousUser.User.Name },
            };
            validMessage.Signature = ByteString.CopyFrom(
              await encryptionService.SignRsaPssSha256Async(
                FeedInboxDecryptionService.GetSignaturePayload(validMessage, victimUser.User.Id),
                thirdPartyUser.PrivateKey
              )
            );

            var encryptedValidMessage = await encryptionService.EncryptRsaOaepSha256Async(
              validMessage.ToByteArray(),
              victimUser.User.PublicKey
            );

            var decryptedValidMessage = await sut.DecryptIfValid(
              victimUser.Identity,
              new GetInboxMessageResponse(Guid.Empty, encryptedValidMessage.DataChunks)
            );

            decryptedValidMessage
              .Should()
              .NotBeNull(
                "Because the signature of the message is valid for a message to a subject"
              );
          }
        );
      });
  }

  private async Task<UserAndPrivateKey> CreateFeedUser()
  {
    var rsaKeyPair = await new OsEncryptionService().GenerateRsaKeysAsync();
    var feedUser = FeedUser.FromShared(Guid.NewGuid(), rsaKeyPair.PublicKey, "Some user") with
    {
      AesKey = await new OsEncryptionService().GenerateAesKeyAsync(),
    };
    return new(
      feedUser,
      new FeedIdentity(
        Id: feedUser.Id,
        Lookup: feedUser.Id.ToString(),
        AesKey: feedUser.AesKey,
        RsaKeyPair: new RsaKeyPair(feedUser.PublicKey, rsaKeyPair.PrivateKey),
        Password: "password",
        Name: feedUser.Name,
        ProfilePicture: null,
        PublishBodyweight: true,
        PublishPlan: true,
        PublishWorkouts: true
      ),
      rsaKeyPair.PrivateKey
    );
  }

  private GetUserResponse ToGetUserResponse(UserAndPrivateKey userAndPrivateKey)
  {
    return new GetUserResponse(
      Id: userAndPrivateKey.User.Id,
      Lookup: userAndPrivateKey.User.Id.ToString(),
      EncryptedCurrentPlan: null,
      EncryptedProfilePicture: null,
      EncryptedName: null,
      EncryptionIV: new byte[16],
      RsaPublicKey: userAndPrivateKey.User.PublicKey.SpkiPublicKeyBytes
    );
  }
}
