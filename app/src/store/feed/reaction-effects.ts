import { Instant } from '@js-joda/core';
import { AddEffectFn, RootState } from '@/store/store';
import {
  cheerFeedItem,
  flushOutbox,
  removeSentReaction,
  selectFeedIdentityRemote,
  setSentReaction,
} from '@/store/feed';
import { MAX_REACTION_COUNT, Reaction, ReactionEmoji, SentReaction } from '@/models/feed-models';
import { uuid } from '@/utils/uuid';
import { enqueueOutboxMessages } from '@/db/feed-outbox';

/** Long enough to swallow a flurry of taps, short enough that the cheer still feels sent. */
const BATCH_WINDOW_MS = 1000;

interface PendingCheer {
  reactionId: string;
  eventId: string;
  emoji: ReactionEmoji;
  count: number;
  /** What to restore if this batch cannot be sent. */
  previous: SentReaction | undefined;
}

/**
 * Taps waiting to be sent, keyed by event and emoji. A cheer is the running total of one emoji on one workout,
 * under one reactionId, so the recipient overwrites a single row as it climbs instead of gaining one per burst.
 */
const pendingCheers = new Map<string, PendingCheer>();

function startBatch(state: RootState, eventId: string, emoji: ReactionEmoji): PendingCheer {
  const previous = Object.values(state.feed.sentReactions)
    .filter((x) => x.eventId === eventId && x.emoji === emoji)
    .sort((a, b) => b.reactedAt.compareTo(a.reactedAt))
    .at(0);
  return { reactionId: previous?.id ?? uuid(), eventId, emoji, count: previous?.count ?? 0, previous };
}

export function addReactionEffects(addEffect: AddEffectFn) {
  addEffect(
    cheerFeedItem,
    async (action, { dispatch, getState, signal, cancelActiveListeners, extra: { db, feedFollowService, logger } }) => {
      const { eventId, emoji } = action.payload;
      const key = `${eventId}:${emoji}`;

      const batch = pendingCheers.get(key) ?? startBatch(getState(), eventId, emoji);
      if (batch.count >= MAX_REACTION_COUNT) {
        return;
      }
      batch.count += 1;
      pendingCheers.set(key, batch);

      // Show it immediately; the network can catch up.
      dispatch(setSentReaction(new SentReaction(batch.reactionId, eventId, emoji, batch.count, Instant.now())));

      // Each new tap supersedes the pending flush, so a flurry becomes one encrypted message rather than one
      // RSA encryption and one PUT per tap.
      cancelActiveListeners();
      await new Promise((resolve) => setTimeout(resolve, BATCH_WINDOW_MS));
      if (signal.aborted) {
        return;
      }

      const state = getState();
      const identityRemote = selectFeedIdentityRemote(state);
      if (!identityRemote.isSuccess()) {
        return;
      }
      const identity = identityRemote.data;

      const toSend = [...pendingCheers.values()];
      pendingCheers.clear();

      for (const cheer of toSend) {
        const event =
          state.feed.feed.find((x) => x.eventId === cheer.eventId) ??
          state.feed.liveSessions.find((x) => x.eventId === cheer.eventId);
        const author = event && state.feed.friends[event.userId];

        const rollBack = () =>
          dispatch(cheer.previous ? setSentReaction(cheer.previous) : removeSentReaction(cheer.reactionId));

        if (author?.status !== 'friend') {
          rollBack();
          continue;
        }

        try {
          const message = await feedFollowService.reactionMessage(
            identity,
            author,
            new Reaction(cheer.reactionId, cheer.eventId, cheer.emoji, cheer.count, Instant.now()),
          );
          enqueueOutboxMessages(db, [message]);
        } catch (error) {
          logger.error('Failed to encrypt cheer', error);
          rollBack();
        }
      }
      dispatch(flushOutbox());
    },
  );
}
