import { asc, eq, inArray, lt, sql } from 'drizzle-orm';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { match } from 'ts-pattern';
import { AddEffectFn, AppDispatch, RootState } from '@/store/store';
import {
  fetchFeedItems,
  fetchInboxItems,
  feedApiError,
  flushOutbox,
  selectFeedIdentityRemote,
  selectAcceptedFriends,
  selectOwnFeedUserId,
  upsertReceivedReactions,
} from '@/store/feed';
import {
  FeedIdentity,
  fromInboxMessageJSON,
  InboxMessage,
  MAX_REACTIONS_PER_SENDER_PER_EVENT,
  ReactionInboxMessage,
  ReceivedReaction,
} from '@/models/feed-models';
import { readExistingSessionIds } from '@/db/sessions';
import { feedInboxQueueSchema, feedInboxSeenSchema } from '@/db/schema';
import { isAwaitingRepairReply } from '@/db/feed-friend-repair';
import { inboxMessageMigrations } from '@/models/storage/versions/migrations';
import { DecryptedInboxMessage } from '@/services/feed-inbox-decryption-service';
import { FeedApiService } from '@/services/feed-api';
import { Logger } from '@/services/logger';
import { Services } from '@/services';
import {
  commitFriendChange,
  handleFriendEnded,
  handleFriendKeys,
  handleFriendRequest,
  handleLegacyFollowRequest,
  InboxHandlerContext,
  InboxHandlerResult,
} from '@/store/feed/friend-effects';

const DAY_MS = 24 * 60 * 60 * 1000;
export const INBOX_SEEN_RETENTION_MS = 60 * DAY_MS;
const MAX_ACK_IDS_PER_REQUEST = 500;

/**
 * PUT /inbox is unauthenticated by design: anyone who knows your user id can post into your inbox, without
 * compromising the server. The signature proves *who* wrote a message, never that they were entitled to. So a
 * cheer is only accepted if it comes from a current friend and targets a workout you actually own.
 *
 * The emoji allowlist and the count bound are enforced earlier, in `Reaction.fromJSON`.
 */
function acceptableReactions(
  messages: ReactionInboxMessage[],
  state: RootState,
  ownSessionIds: Set<string>,
): ReceivedReaction[] {
  const friends = new Set(selectAcceptedFriends(state).map((x) => x.id));
  const existing = Object.values(state.feed.receivedReactions);

  const acceptedPerSender = new Map<string, number>();
  for (const reaction of existing) {
    const key = `${reaction.eventId}:${reaction.fromUserId}`;
    acceptedPerSender.set(key, (acceptedPerSender.get(key) ?? 0) + 1);
  }

  const accepted: ReceivedReaction[] = [];

  for (const message of messages) {
    const { senderUserId, payload } = message;

    if (!friends.has(senderUserId)) {
      continue;
    }
    if (!ownSessionIds.has(payload.eventId)) {
      continue;
    }

    const key = `${payload.eventId}:${senderUserId}`;
    const stored = existing.find((x) => x.id === payload.reactionId);
    if (stored) {
      // A cheer is a running total, so a redelivered or out-of-order copy must not lower it, and only the
      // friend who started it can raise it.
      const raisesOwnTotal =
        stored.fromUserId === senderUserId &&
        stored.eventId === payload.eventId &&
        stored.emoji === payload.emoji &&
        payload.count > stored.count;
      if (!raisesOwnTotal) {
        continue;
      }
    } else if ((acceptedPerSender.get(key) ?? 0) >= MAX_REACTIONS_PER_SENDER_PER_EVENT) {
      continue;
    } else {
      acceptedPerSender.set(key, (acceptedPerSender.get(key) ?? 0) + 1);
    }

    accepted.push(
      new ReceivedReaction(
        payload.reactionId,
        payload.eventId,
        senderUserId,
        payload.emoji,
        payload.count,
        payload.reactedAt,
      ),
    );
  }

  return accepted;
}

export function addInboxEffects(addEffect: AddEffectFn) {
  let isPolling = false;
  let pollAgain = false;
  let refreshFeed = false;

  addEffect(fetchInboxItems, async (action, { dispatch, getState, extra }) => {
    refreshFeed ||= !action.payload.inboxOnly;
    if (isPolling) {
      pollAgain = true;
      return;
    }
    isPolling = true;
    try {
      do {
        pollAgain = false;
        const refreshFeedAfter = refreshFeed;
        refreshFeed = false;
        const identity = selectFeedIdentityRemote(getState()).unwrapOr(undefined);
        if (!identity) {
          return;
        }
        const isCurrentIdentity = () => selectOwnFeedUserId(getState()) === identity.id;

        dispatch(flushOutbox());

        const response = await extra.feedApiService.getInboxMessagesAsync({
          userId: identity.id,
          password: identity.password,
          manualAck: true,
        });
        if (!isCurrentIdentity()) {
          return;
        }

        if (response.isSuccess()) {
          const decrypted = await Promise.all(
            response.data.inboxMessages.map((x) => extra.feedInboxDecryptionService.decrypt(identity, x)),
          );
          if (!isCurrentIdentity()) {
            return;
          }
          queueInboxMessages(extra.db, decrypted);
          await ackInboxMessages(extra.feedApiService, extra.logger, identity, decrypted);
          if (!isCurrentIdentity()) {
            return;
          }
        } else {
          dispatch(
            feedApiError({
              message: 'Failed to fetch inbox items',
              error: response.error!,
              action,
            }),
          );
        }

        await drainInboxQueue(identity, dispatch, getState, extra);
        if (!isCurrentIdentity()) {
          return;
        }
        if (refreshFeedAfter) {
          dispatch(fetchFeedItems({ fromUserAction: false }));
        }
        extra.db
          .delete(feedInboxSeenSchema)
          .where(lt(feedInboxSeenSchema.seenAtMs, Date.now() - INBOX_SEEN_RETENTION_MS))
          .run();
      } while (pollAgain);
    } finally {
      isPolling = false;
    }
  });
}

function queueInboxMessages(db: ExpoSQLiteDatabase, decrypted: DecryptedInboxMessage[]) {
  const nowMs = Date.now();
  const messages = decrypted.filter((x) => x.kind === 'ok');
  if (!messages.length) {
    return;
  }
  db.transaction((tx) => {
    const seen = new Set(
      tx
        .select({ messageId: feedInboxSeenSchema.messageId })
        .from(feedInboxSeenSchema)
        .where(
          inArray(
            feedInboxSeenSchema.messageId,
            messages.map((x) => x.messageId),
          ),
        )
        .all()
        .map((x) => x.messageId),
    );
    for (const message of messages) {
      if (seen.has(message.messageId)) {
        continue;
      }
      seen.add(message.messageId);
      tx.insert(feedInboxSeenSchema).values({ messageId: message.messageId, seenAtMs: nowMs }).run();
      tx.insert(feedInboxQueueSchema)
        .values({ messageId: message.messageId, sentAtMs: message.sentAtMs, payload: message.json })
        .run();
    }
  });
}

async function ackInboxMessages(
  feedApiService: FeedApiService,
  logger: Logger,
  identity: FeedIdentity,
  decrypted: DecryptedInboxMessage[],
) {
  const ids = decrypted.filter((x) => x.kind !== 'retry').map((x) => x.serverId);
  for (let i = 0; i < ids.length; i += MAX_ACK_IDS_PER_REQUEST) {
    const result = await feedApiService.ackInboxMessagesAsync({
      userId: identity.id,
      password: identity.password,
      ids: ids.slice(i, i + MAX_ACK_IDS_PER_REQUEST),
    });
    if (result.isError()) {
      logger.warn('Could not ack inbox messages; they will be redelivered and deduplicated', result.error);
      return;
    }
  }
}

async function drainInboxQueue(
  identity: FeedIdentity,
  dispatch: AppDispatch,
  getState: () => RootState,
  {
    db,
    logger,
    feedApiService,
    feedFollowService,
  }: Pick<Services, 'db' | 'logger' | 'feedApiService' | 'feedFollowService'>,
) {
  const rows = db
    .select()
    .from(feedInboxQueueSchema)
    .orderBy(asc(feedInboxQueueSchema.sentAtMs), asc(sql`rowid`))
    .all();
  const removeRow = (tx: ExpoSQLiteDatabase, messageId: string) =>
    tx.delete(feedInboxQueueSchema).where(eq(feedInboxQueueSchema.messageId, messageId)).run();
  const blockedSenders = new Set<string>();

  for (const row of rows) {
    if (selectOwnFeedUserId(getState()) !== identity.id) {
      return;
    }

    let message: InboxMessage;
    try {
      message = fromInboxMessageJSON(inboxMessageMigrations.migrate(row.payload));
    } catch (error) {
      logger.error('Dropping an inbox message that can no longer be read', error);
      removeRow(db, row.messageId);
      continue;
    }
    if (blockedSenders.has(message.senderUserId)) {
      continue;
    }

    let committed = false;
    const context: InboxHandlerContext = {
      identity,
      sentAtMs: row.sentAtMs,
      getState,
      feedApiService,
      feedFollowService,
      isAwaitingRepairReply: (friendId) => isAwaitingRepairReply(db, friendId),
      commit: (change) => {
        committed = true;
        commitFriendChange(db, dispatch, change, (tx) => removeRow(tx, row.messageId));
      },
    };

    let result: InboxHandlerResult;
    try {
      result = await handleInboxMessage(message, context, db, dispatch);
    } catch (error) {
      logger.error('Failed to process inbox message', error);
      result = 'done';
    }

    if (result === 'retry') {
      blockedSenders.add(message.senderUserId);
    } else if (!committed) {
      removeRow(db, row.messageId);
    }
  }
}

function handleInboxMessage(
  message: InboxMessage,
  context: InboxHandlerContext,
  db: ExpoSQLiteDatabase,
  dispatch: AppDispatch,
): Promise<InboxHandlerResult> {
  return match(message)
    .with({ type: 'FriendRequest' }, (x) => handleFriendRequest(x, context))
    .with({ type: 'FriendKeys' }, (x) => handleFriendKeys(x, context))
    .with({ type: 'FriendReject' }, (x) => handleFriendEnded(x.senderUserId, context, 'pending'))
    .with({ type: 'Unfriend' }, (x) => handleFriendEnded(x.senderUserId, context))
    .with({ type: 'UnfollowNotification' }, (x) => handleFriendEnded(x.senderUserId, context))
    .with({ type: 'FollowRequest' }, (x) => handleLegacyFollowRequest(x.senderUserId, context))
    .with({ type: 'FollowResponse' }, () => Promise.resolve<InboxHandlerResult>('done'))
    .with({ type: 'Reaction' }, (x) => {
      handleReaction(x, db, dispatch, context.getState);
      return Promise.resolve<InboxHandlerResult>('done');
    })
    .exhaustive();
}

function handleReaction(
  reaction: ReactionInboxMessage,
  db: ExpoSQLiteDatabase,
  dispatch: AppDispatch,
  getState: () => RootState,
) {
  const accepted = acceptableReactions([reaction], getState(), readExistingSessionIds(db, [reaction.payload.eventId]));
  if (accepted.length) {
    dispatch(upsertReceivedReactions(accepted));
  }
}
