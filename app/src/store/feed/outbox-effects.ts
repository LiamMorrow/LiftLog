import { asc, eq } from 'drizzle-orm';
import { AddEffectFn } from '@/store/store';
import { flushOutbox, selectFeedIdentityRemote, selectOwnFeedUserId } from '@/store/feed';
import { feedOutboxSchema } from '@/db/schema';
import { fromBase64Uint8ArrayJSON } from '@/models/storage/versions/latest';
import { ApiErrorType } from '@/services/api-error';
import { FeedApiService } from '@/services/feed-api';

const DAY_MS = 24 * 60 * 60 * 1000;
export const OUTBOX_GIVE_UP_AFTER_MS = 30 * DAY_MS;
const BASE_BACKOFF_MS = 15 * 1000;
const MAX_BACKOFF_MS = 60 * 60 * 1000;

export function outboxBackoffMs(attempts: number) {
  return Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** (attempts - 1));
}

export function addOutboxEffects(addEffect: AddEffectFn) {
  let isFlushing = false;
  let flushAgain = false;

  addEffect(flushOutbox, async (_, { getState, extra: { db, feedApiService, logger } }) => {
    if (isFlushing) {
      flushAgain = true;
      return;
    }
    isFlushing = true;
    try {
      do {
        flushAgain = false;
        const identity = selectFeedIdentityRemote(getState()).unwrapOr(undefined);
        if (!identity) {
          return;
        }
        const isCurrentIdentity = () => selectOwnFeedUserId(getState()) === identity.id;

        const nowMs = Date.now();
        const rows = db.select().from(feedOutboxSchema).orderBy(asc(feedOutboxSchema.seq)).all();
        const blockedRecipients = new Set<string>();
        const remove = (seq: number) => db.delete(feedOutboxSchema).where(eq(feedOutboxSchema.seq, seq)).run();

        for (const row of rows) {
          if (blockedRecipients.has(row.recipientId)) {
            continue;
          }
          if (row.nextAttemptAtMs > nowMs) {
            blockedRecipients.add(row.recipientId);
            continue;
          }

          const result = await feedApiService.putInboxMessageAsync({
            toUserId: row.recipientId,
            encryptedMessage: row.encryptedMessage.map(fromBase64Uint8ArrayJSON),
          });
          if (!isCurrentIdentity()) {
            return;
          }

          if (result.isSuccess()) {
            remove(row.seq);
            continue;
          }
          if (result.error?.type === ApiErrorType.BadRequest) {
            logger.error(`Dropping ${row.type} inbox message the server rejected`, result.error);
            remove(row.seq);
            continue;
          }
          if (
            result.error?.type === ApiErrorType.NotFound &&
            (await recipientIsGone(feedApiService, row.recipientId, identity.id))
          ) {
            if (!isCurrentIdentity()) {
              return;
            }
            logger.info(`Dropping inbox messages for ${row.recipientId}, who no longer exists`);
            db.delete(feedOutboxSchema).where(eq(feedOutboxSchema.recipientId, row.recipientId)).run();
            blockedRecipients.add(row.recipientId);
            continue;
          }

          blockedRecipients.add(row.recipientId);
          if (row.createdAtMs < nowMs - OUTBOX_GIVE_UP_AFTER_MS) {
            logger.warn(`Giving up on ${row.type} inbox message after repeated failures`, result.error);
            remove(row.seq);
            continue;
          }
          const attempts = row.attempts + 1;
          db.update(feedOutboxSchema)
            .set({ attempts, nextAttemptAtMs: nowMs + outboxBackoffMs(attempts) })
            .where(eq(feedOutboxSchema.seq, row.seq))
            .run();
        }
      } while (flushAgain);
    } finally {
      isFlushing = false;
    }
  });
}

async function recipientIsGone(feedApiService: FeedApiService, recipientId: string, ownId: string) {
  const recipient = await feedApiService.getUserAsync(recipientId);
  if (recipient.isSuccess() || recipient.error?.type !== ApiErrorType.NotFound) {
    return false;
  }
  return (await feedApiService.getUserAsync(ownId)).isSuccess();
}
