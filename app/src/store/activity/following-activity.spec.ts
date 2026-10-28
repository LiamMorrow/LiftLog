import { describe, expect, it } from 'vitest';
import { DayOfWeek, Instant, LocalDate } from '@js-joda/core';
import { ownHistoryOf, selectFollowingActivity } from '@/store/activity';
import { SessionUserEvent } from '@/models/feed-models';
import { makeFriend } from '@/store/feed/__test__/friends';
import { RemoteData } from '@/models/remote';
import { RootState } from '@/store/store';
import { Session } from '@/models/session-models';
import {
  createExerciseBlueprint,
  createSession,
  createSessionBlueprint,
} from '@/models/session-models/__test__/helpers';

const today = LocalDate.of(2025, 4, 10);

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

function stateWith(events: SessionUserEvent[], userIds: string[], ownUserId?: string): RootState {
  return {
    feed: {
      feed: events,
      friends: Object.fromEntries(userIds.map((id) => [id, makeFriend(id)])),
      identity: ownUserId ? RemoteData.success({ id: ownUserId }) : RemoteData.notAsked(),
    },
  } as unknown as RootState;
}

function withOwn(trainedOn: LocalDate[] = []) {
  const sessions = trainedOn.map((date, index) => ({ id: `own-${index}`, date, volumeKg: 100 }));
  return { today, own: ownHistoryOf(sessions, [], DayOfWeek.MONDAY, today) };
}

describe('selectFollowingActivity', () => {
  it('gives a followed user with no events a full week of empty cells', () => {
    const activity = selectFollowingActivity(stateWith([], ['quiet']), withOwn()).get('quiet');

    expect(activity?.cells).toHaveLength(7);
    expect(activity?.cells.every((cell) => cell.level === 0)).toBe(true);
    expect(activity?.workoutsThisWeek).toBe(0);
    expect(activity?.lastWorkoutDate).toBeUndefined();
  });

  it('counts only the days inside the trailing week, but remembers the last workout beyond it', () => {
    const state = stateWith([event('friend', today.minusDays(2)), event('friend', today.minusDays(30))], ['friend']);

    const activity = selectFollowingActivity(state, withOwn()).get('friend');

    expect(activity?.workoutsThisWeek).toBe(1);
    expect(activity?.lastWorkoutDate?.toString()).toBe(today.minusDays(2).toString());
  });

  it('reports a workout older than the week without counting it', () => {
    const state = stateWith([event('friend', today.minusDays(20))], ['friend']);

    const activity = selectFollowingActivity(state, withOwn()).get('friend');

    expect(activity?.workoutsThisWeek).toBe(0);
    expect(activity?.lastWorkoutDate?.toString()).toBe(today.minusDays(20).toString());
  });

  it('marks today so the strip can ring the current day', () => {
    const activity = selectFollowingActivity(stateWith([], ['friend']), withOwn()).get('friend');

    expect(activity?.cells.filter((cell) => cell.isToday)).toHaveLength(1);
    expect(activity?.cells.at(-1)?.isToday).toBe(true);
  });
});
