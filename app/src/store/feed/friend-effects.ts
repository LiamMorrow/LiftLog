import { Instant } from '@js-joda/core';
import { eq } from 'drizzle-orm';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { AddEffectFn, AppDispatch, RootState } from '@/store/store';
import {
  acceptFriendRequest,
  denyFriendRequest,
  feedApiError,
  fetchAndSetSharedFeedUser,
  flushOutbox,
  putFriends,
  queueFollowSecretRevocations,
  rejectLegacyFollowRequests,
  removeFriend,
  removeFriends,
  removeRevokableFollowSecret,
  requestFriend,
  revokeFollowSecrets,
  rotateFeedKey,
  selectFeedIdentityRemote,
  setSharedFeedUser,
  shareBackWithFriend,
} from '@/store/feed';
import { FeedIdentity, Friend, FriendKeysInboxMessage, FriendRequestInboxMessage } from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { ApiErrorType, ApiResult } from '@/services/api-error';
import { FeedApiService } from '@/services/feed-api';
import { FeedFollowService } from '@/services/feed-follow-service';
import { deleteOutboxMessagesTo, enqueueOutboxMessages, OutboxMessage } from '@/db/feed-outbox';
import { deleteFriends, queueFollowSecretRevocationsIn, writeFriends } from '@/db/feed-friends';
import { feedFollowRequestsSchema } from '@/db/schema';
import { followRequestInboxMessageMigrations } from '@/models/storage/versions/migrations';

export interface FriendChange {
  put?: Friend[];
  remove?: string[];
  clearOutboxTo?: string[];
  outbox?: OutboxMessage[];
  revoke?: string[];
  rotate?: boolean;
}

export function commitFriendChange(
  db: ExpoSQLiteDatabase,
  dispatch: AppDispatch,
  change: FriendChange,
  inTransaction?: (tx: ExpoSQLiteDatabase) => void,
) {
  const { put = [], remove = [], clearOutboxTo = [], outbox = [], revoke = [], rotate = false } = change;
  db.transaction((tx) => {
    clearOutboxTo.forEach((id) => deleteOutboxMessagesTo(tx, id));
    deleteFriends(tx, remove);
    writeFriends(tx, put);
    enqueueOutboxMessages(tx, outbox);
    queueFollowSecretRevocationsIn(tx, revoke);
    inTransaction?.(tx);
  });
  if (remove.length) {
    dispatch(removeFriends(remove));
  }
  if (put.length) {
    dispatch(putFriends(put));
  }
  if (revoke.length) {
    dispatch(queueFollowSecretRevocations(revoke));
    dispatch(revokeFollowSecrets({ fromUserAction: false }));
  }
  if (outbox.length) {
    dispatch(flushOutbox());
  }
  if (rotate) {
    dispatch(rotateFeedKey());
  }
}

export async function removalChange(
  friend: Friend,
  identity: FeedIdentity,
  notify: boolean,
  feedFollowService: FeedFollowService,
): Promise<FriendChange> {
  const notification = !notify
    ? undefined
    : friend.status === 'incoming'
      ? await feedFollowService.friendRejectMessage(identity, friend)
      : await feedFollowService.unfriendMessage(identity, friend);
  return {
    remove: [friend.id],
    clearOutboxTo: [friend.id],
    outbox: notification ? [notification] : [],
    revoke: friend.mySecret ? [friend.mySecret] : [],
    // Rotate the key if we ever actually became friends
    rotate: !!friend.mySecret,
  };
}

async function shareKeysWith(
  friend: Friend,
  identity: FeedIdentity,
  getState: () => RootState,
  feedFollowService: FeedFollowService,
): Promise<ApiResult<{ mySecret: string; message: OutboxMessage }>> {
  let mySecret = friend.mySecret;
  if (!mySecret) {
    const issued = await feedFollowService.issueFollowSecretAsync(identity);
    if (!issued.isSuccess()) {
      return ApiResult.fromFailure(issued);
    }
    mySecret = issued.data;
  }
  let keysFrom = identity;
  for (;;) {
    const message = await feedFollowService.friendKeysMessage(keysFrom, friend, mySecret);
    const current = selectFeedIdentityRemote(getState()).unwrapOr(undefined);
    if (!current || current.id !== keysFrom.id || current.aesKey === keysFrom.aesKey) {
      return ApiResult.success({ mySecret, message });
    }
    keysFrom = current;
  }
}

export interface InboxHandlerContext {
  identity: FeedIdentity;
  sentAtMs: number;
  getState: () => RootState;
  feedApiService: FeedApiService;
  feedFollowService: FeedFollowService;
  commit: (change: FriendChange) => void;
}

export type InboxHandlerResult = 'done' | 'retry';

export async function handleFriendRequest(
  message: FriendRequestInboxMessage,
  { identity, getState, feedApiService, feedFollowService, commit }: InboxHandlerContext,
): Promise<InboxHandlerResult> {
  const friend = getState().feed.friends[message.senderUserId];
  if (!friend) {
    const sender = await feedApiService.getUserAsync(message.senderUserId);
    if (!sender.isSuccess()) {
      return sender.error?.type === ApiErrorType.NotFound ? 'done' : 'retry';
    }
    commit({
      put: [
        new Friend(
          message.senderUserId,
          { spkiPublicKeyBytes: sender.data.rsaPublicKey },
          message.name,
          undefined,
          'incoming',
          [],
          undefined,
          undefined,
          undefined,
        ),
      ],
    });
    return 'done';
  }

  if (friend.status === 'incoming') {
    commit({ put: [friend.with({ name: message.name })] });
    return 'done';
  }
  if (friend.status === 'legacyFollowing') {
    return 'done';
  }

  const shared = await shareKeysWith(friend, identity, getState, feedFollowService);
  if (!shared.isSuccess()) {
    return 'retry';
  }
  commit({ put: [friend.with({ mySecret: shared.data.mySecret })], outbox: [shared.data.message] });
  return 'done';
}

export async function handleFriendKeys(
  message: FriendKeysInboxMessage,
  { identity, sentAtMs, getState, feedFollowService, commit }: InboxHandlerContext,
): Promise<InboxHandlerResult> {
  const friend = getState().feed.friends[message.senderUserId];
  if (!friend || friend.status === 'incoming') {
    return 'done';
  }
  if (friend.theirKeysSentAt && sentAtMs <= friend.theirKeysSentAt.toEpochMilli()) {
    return 'done';
  }

  const updated = friend.with({
    theirKeys: message.aesKeys,
    theirSecret: message.followSecret,
    theirKeysSentAt: Instant.ofEpochMilli(sentAtMs),
    status: friend.status === 'pending' || friend.status === 'legacyFollower' ? 'friend' : friend.status,
  });

  if (friend.status !== 'pending' || friend.mySecret) {
    commit({ put: [updated] });
    return 'done';
  }

  const shared = await shareKeysWith(friend, identity, getState, feedFollowService);
  if (!shared.isSuccess()) {
    return 'retry';
  }
  commit({ put: [updated.with({ mySecret: shared.data.mySecret })], outbox: [shared.data.message] });
  return 'done';
}

export async function handleFriendEnded(
  senderUserId: string,
  { identity, getState, feedFollowService, commit }: InboxHandlerContext,
  onlyWhile?: Friend['status'],
): Promise<InboxHandlerResult> {
  const friend = getState().feed.friends[senderUserId];
  if (!friend || (onlyWhile && friend.status !== onlyWhile)) {
    return 'done';
  }
  commit(await removalChange(friend, identity, false, feedFollowService));
  return 'done';
}

export async function handleLegacyFollowRequest(
  senderUserId: string,
  { identity, feedApiService, feedFollowService, commit }: InboxHandlerContext,
): Promise<InboxHandlerResult> {
  const sender = await feedApiService.getUserAsync(senderUserId);
  if (!sender.isSuccess()) {
    return sender.error?.type === ApiErrorType.NotFound ? 'done' : 'retry';
  }
  commit({
    outbox: [
      await feedFollowService.legacyFollowRejectionMessage(identity, {
        id: senderUserId,
        publicKey: { spkiPublicKeyBytes: sender.data.rsaPublicKey },
      }),
    ],
  });
  return 'done';
}

export function addFriendEffects(addEffect: AddEffectFn) {
  addEffect(fetchAndSetSharedFeedUser, async (action, { dispatch, extra: { feedApiService } }) => {
    dispatch(setSharedFeedUser(RemoteData.loading()));

    const result = await feedApiService.getUserAsync(action.payload.idOrLookup);

    if (result.isSuccess()) {
      dispatch(
        setSharedFeedUser(
          RemoteData.success({
            id: result.data.id,
            publicKey: { spkiPublicKeyBytes: result.data.rsaPublicKey },
            name: action.payload.name,
          }),
        ),
      );
    } else {
      dispatch(
        feedApiError({
          message: 'Failed to fetch user',
          error: result.error!,
          action,
        }),
      );
      dispatch(setSharedFeedUser(RemoteData.error(result.error!)));
    }
  });

  addEffect(requestFriend, async (action, { dispatch, getState, extra: { db, feedFollowService } }) => {
    const identity = selectFeedIdentityRemote(getState()).unwrapOr(undefined);
    const { user } = action.payload;
    if (!identity || user.id === identity.id) {
      return;
    }
    dispatch(setSharedFeedUser(RemoteData.notAsked()));

    const existing = getState().feed.friends[user.id];
    if (existing?.status === 'incoming') {
      dispatch(acceptFriendRequest({ friendId: user.id, fromUserAction: action.payload.fromUserAction }));
      return;
    }
    if (existing?.status === 'legacyFollowing') {
      dispatch(shareBackWithFriend({ friendId: user.id, fromUserAction: action.payload.fromUserAction }));
      return;
    }
    if (existing) {
      return;
    }

    commitFriendChange(db, dispatch, {
      put: [new Friend(user.id, user.publicKey, user.name, undefined, 'pending', [], undefined, undefined, undefined)],
      outbox: [await feedFollowService.friendRequestMessage(identity, user)],
    });
  });

  addEffect(acceptFriendRequest, async (action, { dispatch, getState, extra: { db, feedFollowService } }) => {
    const identity = selectFeedIdentityRemote(getState()).unwrapOr(undefined);
    const friend = getState().feed.friends[action.payload.friendId];
    if (!identity || friend?.status !== 'incoming') {
      return;
    }

    const shared = await shareKeysWith(friend, identity, getState, feedFollowService);
    if (!shared.isSuccess()) {
      dispatch(feedApiError({ message: 'Failed to accept friend request', error: shared.error!, action }));
      return;
    }
    const current = getState().feed.friends[friend.id];
    if (current?.status !== 'incoming') {
      return;
    }
    commitFriendChange(db, dispatch, {
      put: [current.with({ status: 'friend', mySecret: shared.data.mySecret })],
      outbox: [shared.data.message],
    });
  });

  addEffect(shareBackWithFriend, async (action, { dispatch, getState, extra: { db, feedFollowService } }) => {
    const identity = selectFeedIdentityRemote(getState()).unwrapOr(undefined);
    const friend = getState().feed.friends[action.payload.friendId];
    if (!identity || friend?.status !== 'legacyFollowing') {
      return;
    }

    const shared = await shareKeysWith(friend, identity, getState, feedFollowService);
    if (!shared.isSuccess()) {
      dispatch(feedApiError({ message: 'Failed to share back', error: shared.error!, action }));
      return;
    }
    const current = getState().feed.friends[friend.id];
    if (current?.status !== 'legacyFollowing') {
      return;
    }
    commitFriendChange(db, dispatch, {
      put: [current.with({ status: 'friend', mySecret: shared.data.mySecret })],
      outbox: [shared.data.message],
    });
  });

  addEffect(denyFriendRequest, async (action, { dispatch }) => {
    dispatch(removeFriend({ ...action.payload, notify: true }));
  });

  addEffect(removeFriend, async (action, { dispatch, getState, extra: { db, feedFollowService } }) => {
    const identity = selectFeedIdentityRemote(getState()).unwrapOr(undefined);
    const friend = getState().feed.friends[action.payload.friendId];
    if (!identity || !friend) {
      return;
    }
    const change = await removalChange(friend, identity, action.payload.notify, feedFollowService);
    if (!getState().feed.friends[friend.id]) {
      return;
    }
    commitFriendChange(db, dispatch, change);
  });

  addEffect(revokeFollowSecrets, async (action, { dispatch, getState, extra: { feedFollowService } }) => {
    const revokableSecrets = getState().feed.revokedFollowSecrets;
    const identity = selectFeedIdentityRemote(getState());
    if (!revokableSecrets.length || !identity.isSuccess()) {
      return;
    }

    for (const secret of revokableSecrets) {
      const result = await feedFollowService.revokeFollowSecretAsync(identity.data, secret);

      if (
        !result.isSuccess() &&
        result.error?.type !== ApiErrorType.Unauthorized &&
        result.error?.type !== ApiErrorType.NotFound
      ) {
        dispatch(feedApiError({ message: 'Failed to revoke follow secret', error: result.error!, action }));
        return;
      }
      dispatch(removeRevokableFollowSecret(secret));
    }
  });

  addEffect(
    rejectLegacyFollowRequests,
    async (_, { dispatch, getState, extra: { db, feedApiService, feedFollowService } }) => {
      const identity = selectFeedIdentityRemote(getState()).unwrapOr(undefined);
      if (!identity) {
        return;
      }
      const requests = db.select().from(feedFollowRequestsSchema).all();
      for (const row of requests) {
        const senderUserId = followRequestInboxMessageMigrations.migrate(row.payload).senderUserId;
        const sender = await feedApiService.getUserAsync(senderUserId);
        if (!sender.isSuccess() && sender.error?.type !== ApiErrorType.NotFound) {
          continue;
        }
        const message = sender.isSuccess()
          ? await feedFollowService.legacyFollowRejectionMessage(identity, {
              id: senderUserId,
              publicKey: { spkiPublicKeyBytes: sender.data.rsaPublicKey },
            })
          : undefined;
        db.transaction((tx) => {
          enqueueOutboxMessages(tx, message ? [message] : []);
          tx.delete(feedFollowRequestsSchema).where(eq(feedFollowRequestsSchema.id, row.id)).run();
        });
      }
      if (requests.length) {
        dispatch(flushOutbox());
      }
    },
  );
}
