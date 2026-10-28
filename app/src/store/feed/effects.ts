import { Instant } from '@js-joda/core';
import { AddEffectFn, RootState } from '@/store/store';
import {
  addUnpublishedSessionId,
  clearFeedState,
  createFeedIdentity,
  feedApiError,
  fetchInboxItems,
  initializeFeedStateSlice,
  patchFeedState,
  publishUnpublishedSessions,
  removeFeedItems,
  removeReactionsForEvents,
  removeRevokableFollowSecret,
  removeSentReaction,
  removeUnpublishedSessionId,
  rejectLegacyFollowRequests,
  resetFeedAccount,
  restoreFeedBackup,
  revokeFollowSecrets,
  rotateFeedKey,
  selectFeedIdentityRemote,
  selectOwnFeedUserId,
  setIdentity,
  setIsHydrated,
  setSentReaction,
  updateFeedIdentity,
  upsertFeedItems,
  upsertReceivedReactions,
} from '@/store/feed';
import { RemoteData } from '@/models/remote';
import { addSharedItemEffects } from '@/store/feed/shared-item-effects';
import { showSnackbar } from '@/store/app';
import { addFeedItemEffects } from '@/store/feed/feed-items-effects';
import { addInboxEffects } from '@/store/feed/inbox-effects';
import { addFriendEffects } from '@/store/feed/friend-effects';
import { addReactionEffects } from '@/store/feed/reaction-effects';
import { addOutboxEffects } from '@/store/feed/outbox-effects';
import { addRotationEffects, keyHolders } from '@/store/feed/rotation-effects';
import { addRepairEffects } from '@/store/feed/repair-effects';
import { addLiveSessionEffects } from '@/store/feed/live-session-effects';
import { addFeedHubEffects } from '@/store/feed/feed-hub-effects';
import { selectActiveProgram } from '@/store/program';
import { ApiErrorType, ApiResult } from '@/services/api-error';
import { Platform } from 'react-native';
import {
  feedFollowRequestsSchema,
  feedFriendsSchema,
  feedIdentitySchema,
  feedInboxQueueSchema,
  feedInboxSeenSchema,
  feedFriendRepairSchema,
  feedItemsSchema,
  feedOutboxSchema,
  feedReactionsSchema,
  feedRevokedFollowSecretsSchema,
  feedSentReactionsSchema,
  feedUnpublishedSessionsSchema,
} from '@/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import { upsert } from '@/db/helpers';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { FeedIdentity, ReceivedReaction, SentReaction, SessionUserEvent } from '@/models/feed-models';
import { Dispatch } from '@reduxjs/toolkit';
import { EncryptionService } from '@/services/encryption-service';
import { Logger } from '@/services/logger';
import { toRecord } from '@/utils/reduce';
import { feedIdentityMigrations, sessionUserEventMigrations } from '@/models/storage/versions/migrations';
import { setBackendAssignment, switchFeedBackend } from '@/store/backends';
import { readFriends, writeFriends } from '@/db/feed-friends';
import { enqueueOutboxMessages } from '@/db/feed-outbox';

export function applyFeedEffects(addEffect: AddEffectFn) {
  addEffect(
    initializeFeedStateSlice,
    async (_, { cancelActiveListeners, getState, dispatch, extra: { db, logger, encryptionService } }) => {
      cancelActiveListeners();
      const sw = performance.now();
      try {
        const identity = (await db.select().from(feedIdentitySchema)).at(0);
        dispatch(
          patchFeedState({
            identity: identity
              ? RemoteData.success(FeedIdentity.fromJSON(feedIdentityMigrations.migrate(identity.payload)))
              : RemoteData.notAsked(),
            feed: (await db.select().from(feedItemsSchema)).map((x) =>
              SessionUserEvent.fromJSON(sessionUserEventMigrations.migrate(x.payload)),
            ),
            friends: readFriends(db).reduce(
              toRecord(
                (x) => x.id,
                (x) => x,
              ),
              {},
            ),
            revokedFollowSecrets: (await db.select().from(feedRevokedFollowSecretsSchema)).map((x) => x.secret),
            receivedReactions: (await db.select().from(feedReactionsSchema))
              .map((x) => ReceivedReaction.fromJSON(x.payload))
              .reduce(
                toRecord(
                  (x) => x.id,
                  (x) => x,
                ),
                {},
              ),
            sentReactions: (await db.select().from(feedSentReactionsSchema))
              .map((x) => SentReaction.fromJSON(x.payload))
              .reduce(
                toRecord(
                  (x) => x.id,
                  (x) => x,
                ),
                {},
              ),
          }),
        );
        if (!identity) {
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
          await fixIosBadRSAKey(getState, dispatch, encryptionService, logger);
          const loaded = selectFeedIdentityRemote(getState()).unwrapOr(undefined);
          if (loaded && loaded.aesKey.algorithm !== 'AES-GCM') {
            dispatch(rotateFeedKey());
          }
        }

        dispatch(setIsHydrated(true));
        dispatch(revokeFollowSecrets({ fromUserAction: false }));
        // Refreshes the identity if it no longer exists on the server
        dispatch(updateFeedIdentity({ fromUserAction: false, updates: {} }));
        dispatch(rejectLegacyFollowRequests());
        dispatch(fetchInboxItems({ fromUserAction: false }));
        const elapsedMilliseconds = performance.now() - sw;
        logger.info(`Feed state initialized in ${elapsedMilliseconds}ms`);
      } catch (e) {
        logger.error('Failed to initialize feed state', e);
        throw e;
      }
    },
  );
  addEffect(clearFeedState, async (_, { extra: { db } }) => {
    db.transaction((tx) => wipeFeedTables(tx));
  });

  addEffect(
    restoreFeedBackup,
    async (
      action,
      { dispatch, getState, extra: { db, feedIdentityService, feedFollowService, encryptionService } },
    ) => {
      const { feedItems, friends } = action.payload;
      const current = selectFeedIdentityRemote(getState()).unwrapOr(undefined);
      if (current && current.id !== action.payload.identity.id) {
        const result = await feedIdentityService.deleteFeedIdentityAsync(current);
        if (result.isError() && result.error.type !== ApiErrorType.NotFound) {
          dispatch(
            feedApiError({ message: 'Failed to replace the current feed account', error: result.error, action }),
          );
          return;
        }
      }

      const identity = action.payload.identity.withRotatedAesKey(
        await encryptionService.generateAesKey(),
        Instant.now(),
      );
      const outbox = await Promise.all([
        ...friends
          .filter((friend) => friend.status === 'friend' || friend.status === 'pending')
          .map((friend) => feedFollowService.friendRequestMessage(identity, friend)),
        ...keyHolders(friends).map((friend) => feedFollowService.friendKeysMessage(identity, friend, friend.mySecret)),
      ]);

      db.transaction((tx) => {
        wipeFeedTables(tx);
        upsert(tx, feedIdentitySchema, [{ id: 0, payload: identity.toJSON() }]);
        upsert(
          tx,
          feedItemsSchema,
          feedItems.map((x) => ({ id: x.id, payload: x.toJSON() })),
        );
        writeFriends(tx, friends);
        enqueueOutboxMessages(tx, outbox);
      });
      dispatch(initializeFeedStateSlice());
    },
  );

  addEffect(setIdentity, async (action, { extra: { db } }) => {
    if (!action.payload.isSuccess()) {
      return;
    }
    upsert(db, feedIdentitySchema, [
      {
        id: 0,
        payload: action.payload.data.toJSON(),
      },
    ]);
  });

  addEffect(upsertFeedItems, async (action, { extra: { db } }) => {
    upsert(
      db,
      feedItemsSchema,
      action.payload.map((x) => ({
        id: x.id,
        payload: x.toJSON(),
      })),
    );
  });
  addEffect(removeFeedItems, async (action, { extra: { db } }) => {
    if (!action.payload.length) {
      return;
    }
    await db.delete(feedItemsSchema).where(inArray(feedItemsSchema.id, action.payload));
  });
  addEffect(upsertReceivedReactions, async (action, { extra: { db } }) => {
    upsert(
      db,
      feedReactionsSchema,
      action.payload.map((x) => ({ id: x.id, payload: x.toJSON() })),
    );
  });
  addEffect(setSentReaction, async (action, { extra: { db } }) => {
    upsert(db, feedSentReactionsSchema, [{ id: action.payload.id, payload: action.payload.toJSON() }]);
  });
  addEffect(removeSentReaction, async (action, { extra: { db } }) => {
    await db.delete(feedSentReactionsSchema).where(eq(feedSentReactionsSchema.id, action.payload));
  });
  // Rows are keyed by reactionId, so deleting a session's cheers has to match on the payload's eventId.
  addEffect(removeReactionsForEvents, async (action, { extra: { db } }) => {
    if (!action.payload.length) {
      return;
    }
    await db
      .delete(feedReactionsSchema)
      .where(inArray(sql`json_extract(${feedReactionsSchema.payload}, '$.eventId')`, action.payload));
    await db
      .delete(feedSentReactionsSchema)
      .where(inArray(sql`json_extract(${feedSentReactionsSchema.payload}, '$.eventId')`, action.payload));
  });
  addEffect(removeRevokableFollowSecret, async (action, { extra: { db } }) => {
    await db.delete(feedRevokedFollowSecretsSchema).where(eq(feedRevokedFollowSecretsSchema.secret, action.payload));
  });

  addEffect(addUnpublishedSessionId, async (action, { dispatch, extra: { db } }) => {
    await db
      .insert(feedUnpublishedSessionsSchema)
      .values([{ sessionId: action.payload }])
      .onConflictDoNothing();
    dispatch(publishUnpublishedSessions());
  });
  addEffect(removeUnpublishedSessionId, async (action, { extra: { db } }) => {
    await db.delete(feedUnpublishedSessionsSchema).where(eq(feedUnpublishedSessionsSchema.sessionId, action.payload));
  });

  addEffect(feedApiError, async (action, { dispatch, extra: { logger } }) => {
    if (action.payload.action.payload.fromUserAction) {
      dispatch(showSnackbar({ text: action.payload.message }));
    }
    logger.error(
      action.payload.message + ' [msg=' + action.payload.error.message + '; type=' + action.payload.error.type + ']',
      {
        action,
        error: action.payload.error,
      },
    );
  });

  addEffect(
    createFeedIdentity,
    async (action, { cancelActiveListeners, getState, dispatch, extra: { feedIdentityService } }) => {
      cancelActiveListeners();
      if (getState().feed.identity.isLoading()) {
        return;
      }
      const payload = action.payload;
      dispatch(setIdentity(RemoteData.loading()));
      const identityResult = await feedIdentityService.createFeedIdentityAsync(
        payload.name,
        payload.publishBodyweight,
        payload.publishPlan,
        payload.publishWorkouts,
        undefined,
        payload.shareLiveWorkouts,
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
    },
  );

  // Repointing the feed is destructive by nature: the account, its followers and its follow secrets
  // were all issued by the server holding them, and there is no federation to carry them across.
  addEffect(
    switchFeedBackend,
    async (action, { dispatch, stateAfterReduce, extra: { feedIdentityService, logger } }) => {
      const previous = selectFeedIdentityRemote(stateAfterReduce).match({
        success: (identity) => identity,
        error: () => undefined,
        loading: () => undefined,
        notAsked: () => undefined,
      });

      if (previous) {
        const result = await feedIdentityService.deleteFeedIdentityAsync(previous);
        // A server we can no longer reach must not strand the user on it - wipe locally regardless.
        if (result.isError() && result.error.type !== ApiErrorType.NotFound) {
          logger.warn('Could not delete the feed account on the previous backend', result.error);
        }
      }

      dispatch(clearFeedState());
      dispatch(setBackendAssignment({ feature: 'feed', backendId: action.payload.backendId }));
      dispatch(
        createFeedIdentity({
          name: previous?.name,
          publishBodyweight: previous?.publishBodyweight ?? false,
          publishPlan: previous?.publishPlan ?? false,
          publishWorkouts: previous?.publishWorkouts ?? false,
          shareLiveWorkouts: previous?.shareLiveWorkouts ?? false,
          fromUserAction: true,
        }),
      );
    },
  );

  addEffect(
    resetFeedAccount,
    async (action, { dispatch, getState, stateAfterReduce, extra: { feedIdentityService } }) => {
      const identityRemote = selectFeedIdentityRemote(stateAfterReduce);

      const result = await identityRemote
        .map((i) => feedIdentityService.deleteFeedIdentityAsync(i))
        .unwrapOr(Promise.resolve(ApiResult.success()));
      if (result.isError() && result.error.type !== ApiErrorType.NotFound) {
        dispatch(
          feedApiError({
            message: 'Failed to reset account',
            error: result.error,
            action,
          }),
        );
        return;
      }
      if (selectOwnFeedUserId(getState()) !== identityRemote.unwrapOr(undefined)?.id) {
        return;
      }
      dispatch(clearFeedState());
      if (action.payload.createNewIdentity === false) {
        return;
      }
      dispatch(
        createFeedIdentity({
          fromUserAction: true,
          name: action.payload.newIdentity?.name,
          publishBodyweight: action.payload.newIdentity?.publishBodyweight ?? false,
          publishPlan: action.payload.newIdentity?.publishPlan ?? false,
          publishWorkouts: action.payload.newIdentity?.publishWorkouts ?? false,
          shareLiveWorkouts: action.payload.newIdentity?.shareLiveWorkouts ?? false,
        }),
      );
    },
  );

  addEffect(
    updateFeedIdentity,
    async (
      action,
      { stateAfterReduce, dispatch, getState, extra: { feedIdentityService }, cancelActiveListeners, signal },
    ) => {
      cancelActiveListeners();
      const before = selectFeedIdentityRemote(stateAfterReduce).unwrapOr(undefined);
      if (!before) {
        return;
      }
      const { updates } = action.payload;
      const identity = before.with(updates);
      dispatch(setIdentity(RemoteData.success(identity)));

      const result = await feedIdentityService.publishProfileAsync(
        identity,
        stateAfterReduce.program.isHydrated ? selectActiveProgram(stateAfterReduce) : undefined,
      );
      if (signal.aborted || !result.isError()) {
        return;
      }

      if (result.error.type === ApiErrorType.NotFound) {
        dispatch(
          resetFeedAccount({
            fromUserAction: action.payload.fromUserAction,
            newIdentity: identity,
          }),
        );
      }
      dispatch(
        feedApiError({
          message: 'Failed to update profile',
          error: result.error,
          action,
        }),
      );
      const current = selectFeedIdentityRemote(getState()).unwrapOr(undefined);
      if (current?.id === before.id) {
        dispatch(setIdentity(RemoteData.success(current.with(revertedFields(before, updates)))));
      }
    },
  );

  addSharedItemEffects(addEffect);
  addFeedItemEffects(addEffect);
  addInboxEffects(addEffect);
  addOutboxEffects(addEffect);
  addFriendEffects(addEffect);
  addRotationEffects(addEffect);
  addRepairEffects(addEffect);
  addReactionEffects(addEffect);
  addLiveSessionEffects(addEffect);
  addFeedHubEffects(addEffect);
}

function wipeFeedTables(tx: ExpoSQLiteDatabase) {
  for (const table of [
    feedIdentitySchema,
    feedFriendsSchema,
    feedFollowRequestsSchema,
    feedItemsSchema,
    feedReactionsSchema,
    feedSentReactionsSchema,
    feedRevokedFollowSecretsSchema,
    feedOutboxSchema,
    feedInboxQueueSchema,
    feedInboxSeenSchema,
    feedFriendRepairSchema,
  ]) {
    tx.delete(table).run();
  }
}

function revertedFields(before: FeedIdentity, updates: Partial<FeedIdentity>): Partial<FeedIdentity> {
  const keys = Object.keys(updates) as (keyof FeedIdentity)[];
  return Object.fromEntries(keys.map((key) => [key, before[key]]));
}

// There was a period of time where we generated bad keys on IOS
// We can remove this code after December 2026
async function fixIosBadRSAKey(
  getState: () => RootState,
  dispatch: Dispatch,
  encryptionService: EncryptionService,
  logger: Logger,
) {
  if (Platform.OS === 'ios') {
    try {
      await selectFeedIdentityRemote(getState())
        .map((identity) =>
          encryptionService.encryptRsaOaepSha256Async(new Uint8Array([1, 2, 3]), identity.rsaKeyPair.publicKey),
        )
        .unwrapOr(Promise.resolve());
    } catch (error) {
      logger.warn('Failed to encrypt with RSA public key, generating a new one', { error });
      const newKeyPair = await encryptionService.generateRsaKeys();
      dispatch(
        updateFeedIdentity({
          updates: {
            rsaKeyPair: newKeyPair,
          },
          fromUserAction: false,
        }),
      );
    }
  }
}
