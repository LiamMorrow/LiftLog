import { describe, expect, it } from 'vitest';
import { Instant, LocalDate } from '@js-joda/core';
import { selectFollowingActivity } from '@/store/activity';
import { FollowedFeedUser, SessionUserEvent } from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { AesKey, RsaPublicKey } from '@/models/encryption-models';
import { RootState } from '@/store/store';
import { Session } from '@/models/session-models';
import {
  createExerciseBlueprint,
  createSession,
  createSessionBlueprint,
} from '@/models/session-models/__test__/helpers';

const today = LocalDate.of(2025, 4, 10);

const publicKey: RsaPublicKey = { spkiPublicKeyBytes: new Uint8Array([1]) };
const aesKey: AesKey = { value: new Uint8Array([2]) };

function followedUser(id: string) {
  return new FollowedFeedUser(id, publicKey, 'Friend', undefined, aesKey, 'secret');
}

function startedSessionOn(date: LocalDate): Session {
  return createSession(createSessionBlueprint([createExerciseBlueprint(0, false)]), [0]).with({ date });
}

function event(userId: string, date: LocalDate): SessionUserEvent {
  return new SessionUserEvent(
    userId,
    `${userId}-${date.toString()}`,
    Instant.EPOCH,
    Instant.EPOCH,
    startedSessionOn(date),
  );
}

function stateWith(
  events: SessionUserEvent[],
  userIds: string[],
  own?: { userId: string; sessions: Session[] },
): RootState {
  return {
    feed: {
      feed: events,
      followedUsers: Object.fromEntries(userIds.map((id) => [id, followedUser(id)])),
      identity: own ? RemoteData.success({ id: own.userId }) : RemoteData.notAsked(),
    },
    storedSessions: { sessions: own?.sessions ?? [] },
  } as unknown as RootState;
}

describe('selectFollowingActivity', () => {
  it('gives a followed user with no events a full week of empty cells', () => {
    const activity = selectFollowingActivity(stateWith([], ['quiet']), today).get('quiet');

    expect(activity?.cells).toHaveLength(7);
    expect(activity?.cells.every((cell) => cell.level === 0)).toBe(true);
    expect(activity?.workoutsThisWeek).toBe(0);
    expect(activity?.lastWorkoutDate).toBeUndefined();
  });

  it('counts only the days inside the trailing week, but remembers the last workout beyond it', () => {
    const state = stateWith([event('friend', today.minusDays(2)), event('friend', today.minusDays(30))], ['friend']);

    const activity = selectFollowingActivity(state, today).get('friend');

    expect(activity?.workoutsThisWeek).toBe(1);
    expect(activity?.lastWorkoutDate?.toString()).toBe(today.minusDays(2).toString());
  });

  it('reports a workout older than the week without counting it', () => {
    const state = stateWith([event('friend', today.minusDays(20))], ['friend']);

    const activity = selectFollowingActivity(state, today).get('friend');

    expect(activity?.workoutsThisWeek).toBe(0);
    expect(activity?.lastWorkoutDate?.toString()).toBe(today.minusDays(20).toString());
  });

  it('reads a self-follow from stored sessions, which the feed filters out to avoid double-counting', () => {
    const state = stateWith([], ['me'], { userId: 'me', sessions: [startedSessionOn(today.minusDays(1))] });

    const activity = selectFollowingActivity(state, today).get('me');

    expect(activity?.workoutsThisWeek).toBe(1);
    expect(activity?.lastWorkoutDate?.toString()).toBe(today.minusDays(1).toString());
  });

  it('marks today so the strip can ring the current day', () => {
    const activity = selectFollowingActivity(stateWith([], ['friend']), today).get('friend');

    expect(activity?.cells.filter((cell) => cell.isToday)).toHaveLength(1);
    expect(activity?.cells.at(-1)?.isToday).toBe(true);
  });
});
