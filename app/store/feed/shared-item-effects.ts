import { LiftLog } from '@/gen/proto';
import { AesKey } from '@/models/encryption-models';
import { RemoteData } from '@/models/remote';
import { fromSharedItemDao } from '@/models/storage/conversions.from-dao';
import { toSharedItemDao } from '@/models/storage/conversions.to-dao';
import { ApiErrorType } from '@/services/api-error';
import {
  encryptAndShare,
  feedApiError,
  fetchSharedItem,
  setSharedItem,
} from '@/store/feed';
import { addEffect } from '@/store/store';
import { toUrlSafeHexString } from '@/utils/to-url-safe-hex-string';

export function addSharedItemEffects() {
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
      const payload = toSharedItemDao(action.payload);
      const payloadBytes =
        LiftLog.Ui.Models.SharedItemPayload.encode(payload).finish();

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
        'Share your plan!',
      );
    },
  );

  addEffect(
    fetchSharedItem,
    async (a, { dispatch, extra: { feedApiService, encryptionService } }) => {
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
      const sharedItemDao =
        LiftLog.Ui.Models.SharedItemPayload.decode(decryptedBytes);
      const sharedItem = fromSharedItemDao(sharedItemDao);

      if (!sharedItem) {
        dispatch(
          setSharedItem(
            RemoteData.error(
              'Could not read shared item. Please update LiftLog.',
            ),
          ),
        );
        return;
      }

      dispatch(setSharedItem(RemoteData.success(sharedItem)));
    },
  );
}

function getShareUrl(sharedItemId: string, aesKey: AesKey) {
  return `https://app.liftlog.online/feed/shared-item/${sharedItemId}?k=${toUrlSafeHexString(aesKey.value)}`;
}
