import { Instant } from '@js-joda/core';
import { AddEffectFn } from '@/store/store';
import {
  cheerFeedItem,
  feedApiError,
  removeSentReaction,
  selectFeedIdentityRemote,
  setSentReaction,
} from '@/store/feed';
import { MAX_REACTION_COUNT, Reaction, ReactionEmoji, SentReaction } from '@/models/feed-models';
import { uuid } from '@/utils/uuid';

/** Long enough to swallow a flurry of taps, short enough that the cheer still feels sent. */
const BATCH_WINDOW_MS = 1000;

interface PendingCheer {
  reactionId: string;
  eventId: string;
  emoji: ReactionEmoji;
  count: number;
}

/**
 * Taps waiting to be sent, keyed by event and emoji. Each batch keeps one reactionId for its whole life, so
 * the optimistic row upserts over itself as the count climbs, and the recipient can dedupe a redelivery.
 */
const pendingCheers = new Map<string, PendingCheer>();

export function addReactionEffects(addEffect: AddEffectFn) {
  addEffect(
    cheerFeedItem,
    async (action, { dispatch, getState, signal, cancelActiveListeners, extra: { feedFollowService } }) => {
      const { eventId, emoji } = action.payload;
      const key = `${eventId}:${emoji}`;

      const batch = pendingCheers.get(key) ?? { reactionId: uuid(), eventId, emoji, count: 0 };
      batch.count = Math.min(MAX_REACTION_COUNT, batch.count + 1);
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
        const event = state.feed.feed.find((x) => x.eventId === cheer.eventId);
        const author = event && state.feed.followedUsers[event.userId];

        if (!author) {
          dispatch(removeSentReaction(cheer.reactionId));
          continue;
        }

        const result = await feedFollowService.sendReactionAsync(
          identity,
          author,
          new Reaction(cheer.reactionId, cheer.eventId, cheer.emoji, cheer.count, Instant.now()),
        );

        if (result.isError()) {
          dispatch(removeSentReaction(cheer.reactionId));
          dispatch(
            feedApiError({
              message: 'Failed to send cheer',
              error: result.error,
              action,
            }),
          );
        }
      }
    },
  );
}
