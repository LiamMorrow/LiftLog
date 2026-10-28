import { describe, expect, it } from 'vitest';
import { Instant, LocalDate } from '@js-joda/core';
import { FeedIdentity, SessionUserEvent } from '@/models/feed-models';
import { Session } from '@/models/session-models';
import { SessionBlueprint } from '@/models/blueprint-models';
import { Weight } from '@/models/weight';
import { AesKey, RsaKeyPair } from '@/models/encryption-models';
import { feedTimeline } from '@/store/feed/feed-timeline';

function identity(overrides: Partial<FeedIdentity> = {}) {
  return new FeedIdentity('me', 'lookup', {} as AesKey, {} as RsaKeyPair, 'pw', 'Me', false, false, true).with(
    overrides,
  );
}

function session(id: string, day: number, bodyweight?: Weight) {
  return new Session(id, new SessionBlueprint('Push', [], ''), [], LocalDate.of(2026, 7, day), bodyweight, undefined);
}

function friendItem(userId: string, id: string, day: number) {
  const timestamp = Instant.parse('2026-07-20T00:00:00Z');
  return new SessionUserEvent(userId, id, timestamp, timestamp, session(id, day));
}

describe('feedTimeline', () => {
  it('mixes your sessions in with your friends’, newest first', () => {
    const timeline = feedTimeline([friendItem('bob', 'bob-12', 12), friendItem('carol', 'carol-10', 10)], identity(), [
      session('mine-11', 11),
      session('mine-13', 13),
    ]);

    expect(timeline.map((x) => [x.userId, x.eventId])).toEqual([
      ['me', 'mine-13'],
      ['bob', 'bob-12'],
      ['me', 'mine-11'],
      ['carol', 'carol-10'],
    ]);
  });

  it('leaves your sessions out while you are not publishing them', () => {
    const timeline = feedTimeline([friendItem('bob', 'bob-12', 12)], identity({ publishWorkouts: false }), [
      session('mine-11', 11),
    ]);

    expect(timeline.map((x) => x.eventId)).toEqual(['bob-12']);
  });

  it('shows your sessions from history, not copies left in the feed from following yourself', () => {
    const timeline = feedTimeline([friendItem('me', 'mine-11', 11)], identity(), [session('mine-11', 11)]);

    expect(timeline).toHaveLength(1);
  });

  it('shows your sessions as friends see them', () => {
    const bodyweight = new Weight(80, 'kilograms');

    const hidden = feedTimeline([], identity(), [session('mine', 11, bodyweight)]);
    const shared = feedTimeline([], identity({ publishBodyweight: true }), [session('mine', 11, bodyweight)]);

    expect(hidden[0]!.session.bodyweight).toBeUndefined();
    expect(shared[0]!.session.bodyweight).toEqual(bodyweight);
  });
});
