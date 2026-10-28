import { AesKey } from '@/models/encryption-models';
import { fromSharedItemJSON } from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { AnyVersionSharedItemJSON } from '@/models/storage/versions/any';
import { sharedItemMigrations } from '@/models/storage/versions/migrations';
import { fromJsonBytes, toJsonBytes } from '@/services/encryption-service';
import { encryptAndShare, feedApiError, fetchSharedItem, setSharedItem } from '@/store/feed';
import { AddEffectFn } from '@/store/store';
import { createAndStoreFeedIdentity } from '@/store/feed/create-feed-identity';
import { toUrlSafeHexString } from '@/utils/to-url-safe-hex-string';

export function addSharedItemEffects(addEffect: AddEffectFn) {
  addEffect(
    encryptAndShare,
    async (
      action,
      {
        cancelActiveListeners,
        getState,
        dispatch,
        extra: { encryptionService, feedApiService, feedIdentityService, stringSharer },
      },
    ) => {
      cancelActiveListeners();
      const identity =
        getState().feed.identity.unwrapOr(undefined) ??
        (await createAndStoreFeedIdentity(
          { ...action, payload: { ...action.payload, fromUserAction: true } },
          { name: undefined, publishBodyweight: false, publishWorkouts: false },
          { dispatch, getState, feedIdentityService },
        ));
      if (!identity) {
        return;
      }

      const aesKey = await encryptionService.generateAesKey('AES-CBC');
      const payload = action.payload.item.toJSON();
      const payloadBytes = toJsonBytes(payload);

      const encrypted = await encryptionService.signAndEncryptAsync(
        payloadBytes,
        aesKey,
        identity.rsaKeyPair.privateKey,
      );

      const result = await feedApiService.postSharedItemAsync({
        userId: identity.id,
        password: identity.password,
        encryptedPayload: encrypted,
        expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (!result.isSuccess()) {
        dispatch(
          feedApiError({
            message: 'Failed to share feed item',
            error: result.error!,
            action: {
              ...action,
              payload: { ...action.payload, fromUserAction: true },
            },
          }),
        );
        return;
      }

      await stringSharer.share(getShareUrl(result.data.id, aesKey), action.payload.title);
    },
  );

  addEffect(fetchSharedItem, async (a, { dispatch, extra: { feedApiService, encryptionService }, onFail }) => {
    onFail(() => {
      dispatch(setSharedItem(RemoteData.error('Could not read shared item. Please update LiftLog.')));
    });
    dispatch(setSharedItem(RemoteData.loading()));
    const shared = await feedApiService.getSharedItemAsync(a.payload.id);
    if (!shared.isSuccess()) {
      dispatch(setSharedItem(RemoteData.error(shared.error)));
      return;
    }
    const { encryptedPayload, rsaPublicKey } = shared.data;
    const { key: aesKey } = a.payload;

    const decryptedBytes = await encryptionService.decryptAndVerifyAsync(encryptedPayload, aesKey, rsaPublicKey);
    const sharedItemDao = fromJsonBytes<AnyVersionSharedItemJSON>(decryptedBytes);
    const sharedItem = fromSharedItemJSON(sharedItemMigrations.migrate(sharedItemDao));

    dispatch(setSharedItem(RemoteData.success(sharedItem)));
  });
}

function getShareUrl(sharedItemId: string, aesKey: AesKey) {
  return `https://app.liftlog.online/feed/shared-item/${sharedItemId}#${toUrlSafeHexString(aesKey.value)}`;
}
