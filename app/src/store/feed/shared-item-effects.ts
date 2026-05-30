import { AesKey } from '@/models/encryption-models';
import { fromSharedItemJSON } from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { SharedItemJSON } from '@/models/storage/versions/latest';
import { ApiErrorType } from '@/services/api-error';
import { fromJsonBytes, toJsonBytes } from '@/services/encryption-service';
import {
  encryptAndShare,
  feedApiError,
  fetchSharedItem,
  setSharedItem,
} from '@/store/feed';
import { AddEffectFn } from '@/store/store';
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
        extra: { encryptionService, feedApiService, stringSharer, logger },
      },
    ) => {
      cancelActiveListeners();
      const identity = getState().feed.identity;
      if (!identity.isSuccess()) {
        logger.debug('Identity', identity);
        dispatch(
          feedApiError({
            error: {
              exception: new Error('No identity'),
              message: 'Failed to share. Identity not found',
              type: ApiErrorType.Unknown,
            },
            message: 'Failed to share. Identity not found',
            action: {
              ...action,
              payload: { ...action.payload, fromUserAction: true },
            },
          }),
        );
        return;
      }

      const aesKey = await encryptionService.generateAesKey();
      const payload = action.payload.item.toJSON();
      const payloadBytes = toJsonBytes(payload);

      const encrypted =
        await encryptionService.signRsa256PssAndEncryptAesCbcAsync(
          payloadBytes,
          aesKey,
          identity.data.rsaKeyPair.privateKey,
        );

      const result = await feedApiService.postSharedItemAsync({
        userId: identity.data.id,
        password: identity.data.password,
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

      await stringSharer.share(
        getShareUrl(result.data.id, aesKey),
        action.payload.title,
      );
    },
  );

  addEffect(
    fetchSharedItem,
    async (
      a,
      { dispatch, extra: { feedApiService, encryptionService }, onFail },
    ) => {
      onFail(() => {
        dispatch(
          setSharedItem(
            RemoteData.error(
              'Could not read shared item. Please update LiftLog.',
            ),
          ),
        );
      });
      dispatch(setSharedItem(RemoteData.loading()));
      const shared = await feedApiService.getSharedItemAsync(a.payload.id);
      if (!shared.isSuccess()) {
        dispatch(setSharedItem(RemoteData.error(shared.error)));
        return;
      }
      const { encryptedPayload, rsaPublicKey } = shared.data;
      const { key: aesKey } = a.payload;

      const decryptedBytes =
        await encryptionService.decryptAesCbcAndVerifyRsa256PssAsync(
          encryptedPayload,
          aesKey,
          rsaPublicKey,
        );
      const sharedItemDao = fromJsonBytes<SharedItemJSON>(decryptedBytes);
      const sharedItem = fromSharedItemJSON(sharedItemDao);

      dispatch(setSharedItem(RemoteData.success(sharedItem)));
    },
  );
}

function getShareUrl(sharedItemId: string, aesKey: AesKey) {
  return `https://app.liftlog.online/feed/shared-item/${sharedItemId}?k=${toUrlSafeHexString(aesKey.value)}`;
}
