import { asc, inArray, lt, sql } from 'drizzle-orm';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { match } from 'ts-pattern';
import { AddEffectFn, AppDispatch, RootState } from '@/store/store';
import {
  fetchInboxItems,
  feedApiError,
  flushOutbox,
  setFollowRequests,
  processFollowResponses,
  selectFeedIdentityRemote,
  selectFeedFollowRequests,
  revokeFollowSecretAndRemoveFollower,
  selectFeedFollowers,
  selectOwnFeedUserId,
  upsertReceivedReactions,
} from '@/store/feed';
import {
  FeedIdentity,
  FollowRequestInboxMessage,
  FollowResponseInboxMessage,
  fromInboxMessageJSON,
  InboxMessage,
  MAX_REACTIONS_PER_SENDER_PER_EVENT,
  ReactionInboxMessage,
  ReceivedReaction,
} from '@/models/feed-models';
import { readExistingSessionIds } from '@/db/sessions';
import { feedInboxQueueSchema, feedInboxSeenSchema } from '@/db/schema';
import { inboxMessageMigrations } from '@/models/storage/versions/migrations';
import { DecryptedInboxMessage } from '@/services/feed-inbox-decryption-service';
import { FeedApiService } from '@/services/feed-api';
import { Logger } from '@/services/logger';

const DAY_MS = 24 * 60 * 60 * 1000;
export const INBOX_SEEN_RETENTION_MS = 60 * DAY_MS;
const MAX_ACK_IDS_PER_REQUEST = 500;

/**
 * PUT /inbox is unauthenticated by design: anyone who knows your user id can post into your inbox, without
 * compromising the server. The signature proves *who* wrote a message, never that they were entitled to. So a
 * cheer is only accepted if it comes from a current follower and targets a workout you actually own.
 *
 * The emoji allowlist and the count bound are enforced earlier, in `Reaction.fromJSON`.
 */
function acceptableReactions(
  messages: ReactionInboxMessage[],
  state: RootState,
  ownSessionIds: Set<string>,
): ReceivedReaction[] {
  const followers = new Set(selectFeedFollowers(state).map((x) => x.id));
  const existing = Object.values(state.feed.receivedReactions);

  const acceptedPerSender = new Map<string, number>();
  for (const reaction of existing) {
    const key = `${reaction.eventId}:${reaction.fromUserId}`;
    acceptedPerSender.set(key, (acceptedPerSender.get(key) ?? 0) + 1);
  }

  const accepted: ReceivedReaction[] = [];

  for (const message of messages) {
    const { senderUserId, payload } = message;

    if (!followers.has(senderUserId)) {
      continue;
    }
    if (!ownSessionIds.has(payload.eventId)) {
      continue;
    }

    const key = `${payload.eventId}:${senderUserId}`;
    const alreadyStored = existing.some((x) => x.id === payload.reactionId);
    if (!alreadyStored && (acceptedPerSender.get(key) ?? 0) >= MAX_REACTIONS_PER_SENDER_PER_EVENT) {
      continue;
    }
    if (!alreadyStored) {
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

  addEffect(fetchInboxItems, async (action, { dispatch, getState, extra }) => {
    if (isPolling) {
      pollAgain = true;
      return;
    }
    isPolling = true;
    try {
      do {
        pollAgain = false;
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

        drainInboxQueue(extra.db, extra.logger, dispatch, getState);
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

function drainInboxQueue(db: ExpoSQLiteDatabase, logger: Logger, dispatch: AppDispatch, getState: () => RootState) {
  const rows = db
    .select()
    .from(feedInboxQueueSchema)
    .orderBy(asc(feedInboxQueueSchema.sentAtMs), asc(sql`rowid`))
    .all();
  const remove = (messageIds: string[]) => {
    if (messageIds.length) {
      db.delete(feedInboxQueueSchema).where(inArray(feedInboxQueueSchema.messageId, messageIds)).run();
    }
  };

  const followResponses: { messageId: string; message: FollowResponseInboxMessage }[] = [];
  for (const row of rows) {
    try {
      const message: InboxMessage = fromInboxMessageJSON(inboxMessageMigrations.migrate(row.payload));
      if (message.type === 'FollowResponse') {
        followResponses.push({ messageId: row.messageId, message });
        continue;
      }
      match(message)
        .with({ type: 'FollowRequest' }, (x) => handleFollowRequest(x, dispatch, getState))
        .with({ type: 'UnfollowNotification' }, (x) =>
          dispatch(revokeFollowSecretAndRemoveFollower({ userId: x.senderUserId, fromUserAction: false })),
        )
        .with({ type: 'Reaction' }, (x) => handleReaction(x, db, dispatch, getState))
        .exhaustive();
    } catch (error) {
      logger.error('Failed to process inbox message', error);
    }
    remove([row.messageId]);
  }

  if (followResponses.length) {
    dispatch(processFollowResponses({ responses: followResponses.map((x) => x.message) }));
    remove(followResponses.map((x) => x.messageId));
  }
}

function handleFollowRequest(request: FollowRequestInboxMessage, dispatch: AppDispatch, getState: () => RootState) {
  // Someone who already follows us only asks again if they have lost their follow secret.
  if (selectFeedFollowers(getState()).some((x) => x.id === request.senderUserId)) {
    dispatch(revokeFollowSecretAndRemoveFollower({ userId: request.senderUserId, fromUserAction: false }));
  }
  const others = selectFeedFollowRequests(getState()).filter((x) => x.senderUserId !== request.senderUserId);
  dispatch(setFollowRequests([...others, request]));
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
