import { describe, expect, it } from 'vitest';
import { Instant } from '@js-joda/core';
import {
  MAX_REACTION_COUNT,
  Reaction,
  ReactionInboxMessage,
  fromInboxMessageJSON,
  isReactionEmoji,
  isValidReactionCount,
} from '@/models/feed-models';

const reactedAt = Instant.parse('2026-07-13T10:00:00Z');

function reaction() {
  return new Reaction('reaction-1', 'event-1', '💪', 3, reactedAt);
}

describe('isReactionEmoji', () => {
  it('accepts the allowlist', () => {
    expect(isReactionEmoji('💪')).toBe(true);
    expect(isReactionEmoji('🔥')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isReactionEmoji('🍆')).toBe(false);
    expect(isReactionEmoji('')).toBe(false);
    // A hostile follower could otherwise inject a long or direction-overriding string straight into History.
    expect(isReactionEmoji('‮gnihtemos')).toBe(false);
    expect(isReactionEmoji('💪'.repeat(500))).toBe(false);
  });
});

describe('isValidReactionCount', () => {
  it('accepts counts within range', () => {
    expect(isValidReactionCount(1)).toBe(true);
    expect(isValidReactionCount(MAX_REACTION_COUNT)).toBe(true);
  });

  it('rejects counts outside range, fractions and nonsense', () => {
    expect(isValidReactionCount(0)).toBe(false);
    expect(isValidReactionCount(-1)).toBe(false);
    expect(isValidReactionCount(MAX_REACTION_COUNT + 1)).toBe(false);
    expect(isValidReactionCount(99999)).toBe(false);
    expect(isValidReactionCount(1.5)).toBe(false);
    expect(isValidReactionCount(NaN)).toBe(false);
  });
});

describe('Reaction', () => {
  it('round-trips through JSON', () => {
    const restored = Reaction.fromJSON(reaction().toJSON());

    expect(restored.equals(reaction())).toBe(true);
    expect(restored.count).toBe(3);
    expect(restored.reactedAt.equals(reactedAt)).toBe(true);
  });

  it('rejects an emoji outside the allowlist on parse', () => {
    const json = { ...reaction().toJSON(), emoji: '🍆' };

    expect(() => Reaction.fromJSON(json)).toThrow();
  });

  it('rejects an out-of-range count on parse', () => {
    const json = { ...reaction().toJSON(), count: 99999 };

    expect(() => Reaction.fromJSON(json)).toThrow();
  });
});

describe('ReactionInboxMessage', () => {
  it('round-trips through JSON', () => {
    const message = new ReactionInboxMessage('sender-1', new Uint8Array([1, 2, 3]), reaction());

    const restored = ReactionInboxMessage.fromJSON(message.toJSON());

    expect(restored.senderUserId).toBe('sender-1');
    expect(restored.signature).toEqual(new Uint8Array([1, 2, 3]));
    expect(restored.payload.equals(reaction())).toBe(true);
  });

  it('is dispatched by the inbox message union', () => {
    const json = new ReactionInboxMessage('sender-1', new Uint8Array(), reaction()).toJSON();

    const restored = fromInboxMessageJSON(json);

    expect(restored.type).toBe('Reaction');
  });
});
