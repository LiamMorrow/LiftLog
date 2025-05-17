import { addEffect } from '@/store/listenerMiddleware';
import {
  createFeedIdentity,
  encryptAndShare,
  feedApiError,
  fetchInboxItemsAction,
  initializeFeedStateSlice,
  setIdentity,
  setIsHydrated,
} from '@/store/feed';
import { LiftLog } from '@/gen/proto';
import { fromFeedStateDao } from '@/models/storage/conversions.from-dao';
import {
  toFeedStateDao,
  toSharedItemDao,
} from '@/models/storage/conversions.to-dao';
import { RemoteData } from '@/models/remote';
import { selectActiveProgram } from '@/store/program';
import { ApiErrorType } from '@/services/feed-api';
import { AesKey } from '@/models/encryption-models';
import { toUrlSafeHexString } from '@/utils/to-url-safe-hex-string';

const StorageKey = 'FeedState';
export function applyFeedEffects() {
  addEffect(
    initializeFeedStateSlice,
    async (
      _,
      { cancelActiveListeners, dispatch, extra: { keyValueStore, logger } },
    ) => {
      cancelActiveListeners();
      const sw = performance.now();
      try {
        const state = await keyValueStore.getItemBytes(StorageKey);
        if (state) {
          const version = await keyValueStore.getItem(`${StorageKey}Version`);
          if (!version || version === '1') {
            const feedStateDao = LiftLog.Ui.Models.FeedStateDaoV1.decode(state);
            const feedState = fromFeedStateDao(feedStateDao);

            if (!feedState.identity) {
              dispatch(
                createFeedIdentity({
                  name: undefined,
                  publishBodyweight: false,
                  publishPlan: false,
                  publishWorkouts: false,
                  fromUserAction: false,
                }),
              );
            } else {
              dispatch(
                createFeedIdentity({
                  name: undefined,
                  publishBodyweight: false,
                  publishPlan: false,
                  publishWorkouts: false,
                  fromUserAction: false,
                }),
              );
            }
          }
        }
        dispatch(setIsHydrated(true));
        dispatch(fetchInboxItemsAction({ fromUserAction: false }));
        const elapsedMilliseconds = performance.now() - sw;
        logger.info(`Feed state initialized in ${elapsedMilliseconds}ms`);
      } catch (e) {
        logger.error('Failed to initialize feed state', e);
        throw e;
      }
    },
  );

  addEffect(feedApiError, async (action, { dispatch, extra: { logger } }) => {
    if (action.payload.action.payload.fromUserAction) {
      // TODO dispatch toast
    }
    logger.error(action.payload.message, {
      action,
      error: action.payload.error,
    });
  });

  addEffect(
    undefined,
    async (
      _,
      {
        cancelActiveListeners,
        stateAfterReduce,
        originalState,
        extra: { keyValueStore },
      },
    ) => {
      cancelActiveListeners();
      if (
        stateAfterReduce.feed === originalState.feed ||
        !stateAfterReduce.feed.isHydrated
      ) {
        return;
      }
      const dao = toFeedStateDao(stateAfterReduce.feed);
      const bytes = LiftLog.Ui.Models.FeedStateDaoV1.encode(dao).finish();

      await keyValueStore.setItem(StorageKey, bytes);
      await keyValueStore.setItem(`${StorageKey}Version`, '1');
    },
  );

  addEffect(
    createFeedIdentity,
    async (
      action,
      {
        cancelActiveListeners,
        getState,
        dispatch,
        extra: { feedIdentityService, encryptionService },
      },
    ) => {
      cancelActiveListeners();
      if (getState().feed.identity.isLoading()) {
        return;
      }
      const payload = action.payload;
      dispatch(setIdentity(RemoteData.loading()));
      const identityResult = await feedIdentityService.createFeedIdentityAsync(
        payload.name,
        undefined,
        payload.publishBodyweight,
        payload.publishPlan,
        payload.publishWorkouts,
        selectActiveProgram(getState()).sessions,
      );
      if (!identityResult.isSuccess()) {
        dispatch(
          feedApiError({
            message: 'Failed to create user',
            error: identityResult.error!,
            action,
          }),
        );
        dispatch(setIdentity(RemoteData.error(identityResult.error)));
        return;
      }
      dispatch(setIdentity(RemoteData.success(identityResult.data)));
      const encrypted =
        await encryptionService.signRsa256PssAndEncryptAesCbcAsync(
          new TextEncoder().encode('hello'),
          identityResult.data.aesKey,
          identityResult.data.rsaKeyPair.privateKey,
        );
      const decrypted =
        await encryptionService.decryptAesCbcAndVerifyRsa256PssAsync(
          encrypted,
          identityResult.data.aesKey,
          identityResult.data.rsaKeyPair.publicKey,
        );
      debugger;
    },
  );

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
      const decrypted =
        await encryptionService.decryptAesCbcAndVerifyRsa256PssAsync(
          encrypted,
          aesKey,
          identity.data.rsaKeyPair.publicKey,
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
}

function getShareUrl(sharedItemId: string, aesKey: AesKey) {
  return `https://app.liftlog.online/feed/shared-item/${sharedItemId}?k=${toUrlSafeHexString(aesKey.value)}`;
}
