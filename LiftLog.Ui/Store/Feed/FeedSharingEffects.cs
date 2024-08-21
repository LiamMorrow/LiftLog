using System.Collections.Immutable;
using System.Text;
using Fluxor;
using Google.Protobuf;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using LiftLog.Ui.Models;
using LiftLog.Ui.Models.SessionHistoryDao;
using LiftLog.Ui.Services;
using Microsoft.Extensions.Logging;
using static LiftLog.Ui.Models.UserEventPayload;

namespace LiftLog.Ui.Store.Feed;

public class FeedSharingEffects(
    IState<FeedState> feedState,
    IEncryptionService encryptionService,
    IFeedApiService feedApiService,
    IStringSharer stringSharer,
    ILogger<FeedSharingEffects> logger
)
{
    [EffectMethod]
    public async Task HandleEncryptAndShareAction(
        EncryptAndShareAction action,
        IDispatcher dispatcher
    )
    {
        var identity = feedState.Value.Identity;
        if (identity is null)
        {
            logger.LogError("Failed to share feed item with error {Error}", "Identity not found");
            return;
        }

        var aesKey = await encryptionService.GenerateAesKeyAsync();
        var payload = SharedItemPayload.FromModel(action.SharedItem).ToByteArray();

        var encrypted = await encryptionService.SignRsa256PssAndEncryptAesCbcAsync(
            payload,
            aesKey,
            identity.RsaKeyPair.PrivateKey
        );

        var result = await feedApiService.PostSharedItemAsync(
            new CreateSharedItemRequest(
                identity.Id,
                identity.Password,
                encrypted,
                DateTimeOffset.UtcNow + TimeSpan.FromDays(90)
            )
        );
        if (!result.IsSuccess)
        {
            logger.LogError("Failed to share feed with error {Error}", result.Error);
            return;
        }

        await stringSharer.ShareAsync(GetShareUrl(result.Data.Id, aesKey));
    }

    [EffectMethod]
    public async Task HandleFetchSharedItemAction(
        FetchSharedItemAction action,
        IDispatcher dispatcher
    )
    {
        dispatcher.Dispatch(new SetSharedItemAction(RemoteData.Loading));
        var result = await feedApiService.GetSharedItemAsync(action.Id);
        if (!result.IsSuccess)
        {
            logger.LogError("Failed to fetch shared item with error {Error}", result.Error);
            var errorMessage = result.Error.Type switch
            {
                ApiErrorType.NotFound => "Shared item not found",
                ApiErrorType.Unauthorized => "Unauthorized to view shared item",
                _ => "Error fetching shared item",
            };
            dispatcher.Dispatch(new SetSharedItemAction(RemoteData.Errored(errorMessage)));
            return;
        }

        var decryptedPayload = await TryDecrypt(
            result.Data.EncryptedPayload,
            action.AesKey,
            result.Data.RsaPublicKey
        );
        if (decryptedPayload is null)
        {
            dispatcher.Dispatch(
                new SetSharedItemAction(RemoteData.Errored("Failed to decrypt shared item"))
            );
            return;
        }
        var sharedItemPayload = SharedItemPayload.Parser.ParseFrom(decryptedPayload);
        var sharedItem = sharedItemPayload.ToModel();
        if (sharedItem is null)
        {
            logger.LogError(
                "Failed to parse shared item {PayloadCase}",
                sharedItemPayload.PayloadCase
            );
            dispatcher.Dispatch(
                new SetSharedItemAction(
                    RemoteData.Errored(
                        "Failed to parse shared content. Please update the app to the latest version and try again."
                    )
                )
            );
            return;
        }
        dispatcher.Dispatch(new SetSharedItemAction(RemoteData.Success(sharedItem)));
    }

    private async Task<byte[]?> TryDecrypt(
        AesEncryptedAndRsaSignedData encrypted,
        AesKey aesKey,
        RsaPublicKey rsaPublicKey
    )
    {
        try
        {
            return await encryptionService.DecryptAesCbcAndVerifyRsa256PssAsync(
                encrypted,
                aesKey,
                rsaPublicKey
            );
        }
        catch (Exception e)
        {
            logger.LogError("Failed to decrypt shared item with error {Error}", e.Message);
            return null;
        }
    }

    private static string GetShareUrl(string sharedItemId, AesKey aesKey) =>
#if DEBUG
        $"https://0.0.0.0:5001/feed/shared-item/{sharedItemId}?k={aesKey.Value.ToUrlSafeHexString()}";
#else
        $"https://app.liftlog.online/feed/shared-item/{sharedItemId}?k={aesKey.Value.ToUrlSafeHexString()}";
#endif
}
