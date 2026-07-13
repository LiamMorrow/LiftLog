import { AddEffectFn, RootState } from '@/store/store';
import {
  addFollower,
  addRevokableFollowSecret,
  addUnpublishedSessionId,
  clearFeedState,
  createFeedIdentity,
  feedApiError,
  fetchInboxItems,
  initializeFeedStateSlice,
  patchFeedState,
  putFollowedUser,
  removeFeedItems,
  removeFollowedUser,
  removeFollower,
  removeFollowRequest,
  removeReactionsForEvents,
  removeRevokableFollowSecret,
  removeSentReaction,
  removeUnpublishedSessionId,
  resetFeedAccount,
  revokeFollowSecrets,
  selectFeedIdentityRemote,
  setFollowRequests,
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
import { addFollowingEffects } from '@/store/feed/following-effects';
import { addReactionEffects } from '@/store/feed/reaction-effects';
import { selectActiveProgram } from '@/store/program';
import { ApiErrorType, ApiResult } from '@/services/api-error';
import { Platform } from 'react-native';
import {
  feedFollowedUsersSchema,
  feedFollowerUsersSchema,
  feedFollowRequestsSchema,
  feedIdentitySchema,
  feedItemsSchema,
  feedPendingUsersSchema,
  feedReactionsSchema,
  feedRevokedFollowSecretsSchema,
  feedSentReactionsSchema,
  feedUnpublishedSessionsSchema,
} from '@/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import { upsert } from '@/db/helpers';
import {
  FeedIdentity,
  FollowerFeedUser,
  FollowRequestInboxMessage,
  fromFeedUserJSON,
  ReceivedReaction,
  SentReaction,
  SessionUserEvent,
} from '@/models/feed-models';
import { Dispatch } from '@reduxjs/toolkit';
import { EncryptionService } from '@/services/encryption-service';
import { Logger } from '@/services/logger';
import { toRecord } from '@/utils/reduce';
import { FeedUserJSON } from '@/models/storage/versions/latest';

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
            identity: identity ? RemoteData.success(FeedIdentity.fromJSON(identity.payload)) : RemoteData.notAsked(),
            feed: (await db.select().from(feedItemsSchema)).map((x) => SessionUserEvent.fromJSON(x.payload)),
            followRequests: (await db.select().from(feedFollowRequestsSchema)).map((x) =>
              FollowRequestInboxMessage.fromJSON(x.payload),
            ),
            followedUsers: (
              (await db.select().from(feedFollowedUsersSchema)) as {
                payload: FeedUserJSON;
              }[]
            )
              .concat(await db.select().from(feedPendingUsersSchema))
              .map((x) => fromFeedUserJSON(x.payload))
              .reduce(
                toRecord(
                  (x) => x.id,
                  (x) => x,
                ),
                {},
              ),
            revokedFollowSecrets: (await db.select().from(feedRevokedFollowSecretsSchema)).map((x) => x.secret),
            followers: (await db.select().from(feedFollowerUsersSchema))
              .map((x) => FollowerFeedUser.fromJSON(x.payload))
              .reduce(
                toRecord(
                  (x) => x.id,
                  (x) => x,
                ),
                {},
              ),
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
        }

        dispatch(setIsHydrated(true));
        dispatch(revokeFollowSecrets({ fromUserAction: false }));
        // Refreshes the identity if it no longer exists on the server
        dispatch(updateFeedIdentity({ fromUserAction: false, updates: {} }));
        dispatch(fetchInboxItems({ fromUserAction: false }));
        const elapsedMilliseconds = performance.now() - sw;
        logger.info(`Feed state initialized in ${elapsedMilliseconds}ms`);
      } catch (e) {
        logger.error('Failed to initialize feed state', e);
        throw e;
      }
    },
  );
  addEffect(setIdentity, async (action, { extra: { db } }) => {
    if (!action.payload.isSuccess()) {
      return;
    }
    await upsert(db, feedIdentitySchema, [
      {
        id: 0,
        payload: action.payload.data.toJSON(),
      },
    ]);
  });

  addEffect(removeFollowedUser, async (action, { extra: { db } }) => {
    await db.delete(feedFollowedUsersSchema).where(eq(feedFollowedUsersSchema.id, action.payload));
    await db.delete(feedPendingUsersSchema).where(eq(feedPendingUsersSchema.id, action.payload));
  });

  addEffect(setFollowRequests, async (action, { extra: { db } }) => {
    await db.transaction(async (tx) => {
      await tx.delete(feedFollowRequestsSchema);
      await upsert(
        tx,
        feedFollowRequestsSchema,
        action.payload.map((req) => ({
          id: req.senderUserId,
          payload: req.toJSON(),
        })),
      );
    });
  });
  addEffect(addFollower, async (action, { extra: { db } }) => {
    await upsert(db, feedFollowerUsersSchema, [
      {
        id: action.payload.id,
        payload: action.payload.toJSON(),
      },
    ]);
  });
  addEffect(removeFollower, async (action, { extra: { db } }) => {
    await db.delete(feedFollowerUsersSchema).where(eq(feedFollowerUsersSchema.id, action.payload));
  });
  addEffect(removeFollowRequest, async (action, { extra: { db } }) => {
    await db.delete(feedFollowRequestsSchema).where(eq(feedFollowRequestsSchema.id, action.payload.senderUserId));
  });
  addEffect(putFollowedUser, async (action, { extra: { db } }) => {
    await db.transaction(async (tx) => {
      if (action.payload.type === 'PendingFeedUser') {
        await upsert(tx, feedPendingUsersSchema, [
          {
            id: action.payload.id,
            payload: action.payload.toJSON(),
          },
        ]);
        await tx.delete(feedFollowedUsersSchema).where(eq(feedFollowedUsersSchema.id, action.payload.id));
      } else {
        await tx.delete(feedPendingUsersSchema).where(eq(feedPendingUsersSchema.id, action.payload.id));
        await upsert(tx, feedFollowedUsersSchema, [
          {
            id: action.payload.id,
            payload: action.payload.toJSON(),
          },
        ]);
      }
    });
  });
  addEffect(upsertFeedItems, async (action, { extra: { db } }) => {
    await upsert(
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
    await upsert(
      db,
      feedReactionsSchema,
      action.payload.map((x) => ({ id: x.id, payload: x.toJSON() })),
    );
  });
  addEffect(setSentReaction, async (action, { extra: { db } }) => {
    await upsert(db, feedSentReactionsSchema, [{ id: action.payload.id, payload: action.payload.toJSON() }]);
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
  addEffect(addRevokableFollowSecret, async (action, { extra: { db } }) => {
    await db
      .insert(feedRevokedFollowSecretsSchema)
      .values([{ secret: action.payload }])
      .onConflictDoNothing();
  });
  addEffect(removeRevokableFollowSecret, async (action, { extra: { db } }) => {
    await db.delete(feedRevokedFollowSecretsSchema).where(eq(feedRevokedFollowSecretsSchema.secret, action.payload));
  });

  addEffect(addUnpublishedSessionId, async (action, { extra: { db } }) => {
    await db
      .insert(feedUnpublishedSessionsSchema)
      .values([{ sessionId: action.payload }])
      .onConflictDoNothing();
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

  addEffect(resetFeedAccount, async (action, { dispatch, stateAfterReduce, extra: { feedIdentityService } }) => {
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
      }),
    );
  });

  addEffect(
    updateFeedIdentity,
    async (
      action,
      { stateAfterReduce, dispatch, getState, extra: { feedIdentityService }, cancelActiveListeners, signal },
    ) => {
      cancelActiveListeners();
      const oldFeedIdentity = selectFeedIdentityRemote(stateAfterReduce);
      if (!oldFeedIdentity.isSuccess()) {
        return;
      }
      dispatch(setIdentity(oldFeedIdentity.map((x) => x.with(action.payload.updates))));
      const feedIdentityRemote = selectFeedIdentityRemote(getState());
      if (!feedIdentityRemote.isSuccess()) {
        dispatch(setIdentity(oldFeedIdentity));
        return;
      }
      const identity = feedIdentityRemote.data;
      // We optimistically updated the identity, so now we can just use its values
      const result = await feedIdentityService.updateFeedIdentityAsync(
        identity.id,
        identity.lookup,
        identity.password,
        identity.aesKey,
        identity.rsaKeyPair,
        identity.name,
        identity.publishBodyweight,
        identity.publishPlan,
        identity.publishWorkouts,
        stateAfterReduce.program.isHydrated ? selectActiveProgram(stateAfterReduce) : undefined,
      );
      if (signal.aborted) {
        return;
      }

      if (result.isError()) {
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
        dispatch(setIdentity(oldFeedIdentity));
        return;
      }

      dispatch(setIdentity(RemoteData.success(result.data!)));
    },
  );

  addSharedItemEffects(addEffect);
  addFeedItemEffects(addEffect);
  addInboxEffects(addEffect);
  addFollowingEffects(addEffect);
  addReactionEffects(addEffect);
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
