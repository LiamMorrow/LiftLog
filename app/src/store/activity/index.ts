import { createSelector } from '@reduxjs/toolkit';
import { LocalDate, YearMonth } from '@js-joda/core';
import { SessionUserEvent } from '@/models/feed-models';
import { RootState } from '@/store/store';
import { ActivityCell, ActivityRow, VolumeScale } from '@/store/activity/activity-types';
import { levelFor, sessionVolume, volumeScaleOf } from '@/store/activity/volume';
import { DayActivity, OwnHistory } from '@/store/activity/own-history';
import { weeksInMonth } from '@/store/activity/week-start';
import { findPersonalRecords, PersonalRecord } from '@/store/stats/personal-records';

export * from '@/store/activity/activity-types';
export * from '@/store/activity/volume';
export * from '@/store/activity/streak';
export * from '@/store/activity/week-start';
export * from '@/store/activity/own-history';

/** Identifies the current user's own row/scale, which has no feed userId of its own. */
export const OWN_USER_KEY = 'me';

const selectAllFeedEvents = (state: RootState) => state.feed.feed;
const selectFollowedUsers = createSelector([(state: RootState) => state.feed.friends], (friends) =>
  Object.fromEntries(Object.entries(friends).filter(([, friend]) => friend.status === 'friend')),
);
const selectFirstDayOfWeek = (state: RootState) => state.settings.firstDayOfWeek;
const selectOwnFeedUserId = (state: RootState) => state.feed.identity.unwrapOr(undefined)?.id;

/** Own activity always comes from your own history */
const selectFeedEvents = createSelector([selectAllFeedEvents, selectOwnFeedUserId], (feed, ownUserId) =>
  ownUserId === undefined ? feed : feed.filter((x) => x.userId !== ownUserId),
);

function groupByDate<T>(items: T[], dateOf: (item: T) => LocalDate): Map<string, T[]> {
  const byDate = new Map<string, T[]>();
  for (const item of items) {
    const key = dateOf(item).toString();
    const existing = byDate.get(key);
    if (existing) {
      existing.push(item);
    } else {
      byDate.set(key, [item]);
    }
  }
  return byDate;
}

/** Keyed by the date the session was performed, not the event timestamp. */
export const selectFeedEventsByDate = createSelector([selectFeedEvents], (feed) =>
  groupByDate(
    feed.filter((x) => x.session.isStarted),
    (x) => x.session.date,
  ),
);

/**
 * Per-user volume ranges, each normalised over everything of theirs we hold rather than the visible month.
 * Yours is in {@link OwnHistory}.
 */
export const selectFeedVolumeScales = createSelector([selectFeedEvents], (feed): Map<string, VolumeScale> => {
  const volumesByUser = new Map<string, number[]>();

  for (const event of feed) {
    if (!event.session.isStarted) continue;
    const volumes = volumesByUser.get(event.userId);
    if (volumes) {
      volumes.push(sessionVolume(event.session));
    } else {
      volumesByUser.set(event.userId, [sessionVolume(event.session)]);
    }
  }

  return new Map([...volumesByUser].map(([userId, volumes]) => [userId, volumeScaleOf(volumes)]));
});

const selectFollowedUserNames = createSelector(
  [selectFollowedUsers],
  (followedUsers) => new Map(Object.entries(followedUsers).map(([userId, user]) => [userId, user.name])),
);

export const selectFollowsOtherUsers = createSelector(
  [selectFollowedUsers],
  (followedUsers) => Object.keys(followedUsers).length > 0,
);

function buildOwnCell(date: LocalDate, own: OwnHistory, today: LocalDate, isOutsideFocus: boolean): ActivityCell {
  const day = own.days.get(date.toString()) ?? noActivity;
  const scale = own.volumeScale;

  return {
    date,
    level: day.sessionCount === 0 || !scale ? 0 : levelFor(day.volume, scale),
    sessionCount: day.sessionCount,
    isToday: date.isEqual(today),
    isFuture: date.isAfter(today),
    isOutsideFocus,
  };
}

const noActivity: DayActivity = { sessionCount: 0, volume: 0 };

export interface ActivityWeekParams {
  today: LocalDate;
  own: OwnHistory;
}

export interface ActivityMonthParams extends ActivityWeekParams {
  yearMonth: YearMonth;
}

/** `today` is an argument rather than read from the clock, so memoization can't go stale across midnight. */
export const selectActivityMonth = createSelector(
  [
    selectFirstDayOfWeek,
    (_: RootState, params: ActivityMonthParams) => params.yearMonth,
    (_: RootState, params: ActivityMonthParams) => params.today,
    (_: RootState, params: ActivityMonthParams) => params.own,
  ],
  (firstDayOfWeek, yearMonth, today, own): ActivityRow[] => {
    const firstOfMonth = LocalDate.of(yearMonth.year(), yearMonth.monthValue(), 1);

    const leadingDays = (firstOfMonth.dayOfWeek().value() - firstDayOfWeek.value() + 7) % 7;
    const totalDays = weeksInMonth(yearMonth, firstDayOfWeek) * 7;

    const cells = Array.from({ length: totalDays }, (_, index) => {
      const date = firstOfMonth.plusDays(index - leadingDays);
      return buildOwnCell(date, own, today, index < leadingDays || index >= leadingDays + yearMonth.lengthOfMonth());
    });

    const rows: ActivityRow[] = [];
    for (let start = 0; start < cells.length; start += 7) {
      rows.push({ key: `week-${start / 7}`, cells: cells.slice(start, start + 7) });
    }

    return rows;
  },
);

/** The seven days ending on `today`, as one row per user - you first, then whoever else trained. */
export const selectActivityWeek = createSelector(
  [
    selectFeedEventsByDate,
    selectFeedVolumeScales,
    selectFollowedUserNames,
    (_: RootState, params: ActivityWeekParams) => params.today,
    (_: RootState, params: ActivityWeekParams) => params.own,
  ],
  (feedEvents, scales, names, today, own): ActivityRow[] => {
    const days = Array.from({ length: 7 }, (_, index) => today.minusDays(6 - index));

    const ownRow: ActivityRow = {
      key: OWN_USER_KEY,
      cells: days.map((date) => buildOwnCell(date, own, today, false)),
    };

    const userIdsWithActivity = new Set(
      days.flatMap((date) => (feedEvents.get(date.toString()) ?? []).map((event) => event.userId)),
    );

    const friendRows = [...userIdsWithActivity].map((userId): ActivityRow => {
      const scale = scales.get(userId);
      return {
        key: userId,
        label: names.get(userId),
        cells: days.map((date) => {
          const events = (feedEvents.get(date.toString()) ?? []).filter((event) => event.userId === userId);
          const volume = events.reduce((total, event) => total + sessionVolume(event.session), 0);

          return {
            date,
            level: events.length === 0 || !scale ? 0 : levelFor(volume, scale),
            sessionCount: events.length,
            isToday: date.isEqual(today),
            isFuture: false,
            isOutsideFocus: false,
          } satisfies ActivityCell;
        }),
      };
    });

    return [ownRow, ...friendRows];
  },
);

export interface FollowingActivity {
  cells: ActivityCell[];
  workoutsThisWeek: number;
  /** Absent when they have published nothing inside the retention window -- not when they have never trained. */
  lastWorkoutDate?: LocalDate;
}

/**
 * One seven-day row per friend, including the ones who have gone quiet -- `selectActivityWeek` drops
 * those, but the Friends tab has to say something about them, so they get a row of empty cells instead.
 */
export const selectFollowingActivity = createSelector(
  [
    selectFeedEventsByDate,
    selectFeedVolumeScales,
    selectFollowedUsers,
    (_: RootState, params: ActivityWeekParams) => params.today,
  ],
  (feedEvents, scales, followedUsers, today): Map<string, FollowingActivity> => {
    const days = Array.from({ length: 7 }, (_, index) => today.minusDays(6 - index));

    return new Map(
      Object.keys(followedUsers).map((userId) => {
        const scale = scales.get(userId);

        const activityOn = (date: LocalDate): DayActivity => {
          const events = (feedEvents.get(date.toString()) ?? []).filter((event) => event.userId === userId);
          return {
            sessionCount: events.length,
            volume: events.reduce((total, event) => total + sessionVolume(event.session), 0),
          };
        };

        const cells = days.map((date): ActivityCell => {
          const day = activityOn(date);

          return {
            date,
            level: day.sessionCount === 0 || !scale ? 0 : levelFor(day.volume, scale),
            sessionCount: day.sessionCount,
            isToday: date.isEqual(today),
            isFuture: false,
            isOutsideFocus: false,
          };
        });

        const trainedOn = (date: string) => (feedEvents.get(date) ?? []).some((event) => event.userId === userId);
        const lastWorkoutDate = [...feedEvents.keys()]
          .filter(trainedOn)
          .map((date) => LocalDate.parse(date))
          .reduce<LocalDate | undefined>(
            (latest, date) => (!latest || date.isAfter(latest) ? date : latest),
            undefined,
          );

        return [
          userId,
          {
            cells,
            workoutsThisWeek: cells.filter((cell) => cell.sessionCount > 0).length,
            lastWorkoutDate,
          },
        ];
      }),
    );
  },
);

/**
 * Records per feed event, computed per author over the sessions of theirs we hold. That's only the 90-day
 * retention window, so the copy must say "best in 90 days" and never "all-time".
 */
export const selectFeedPersonalRecords = createSelector([selectFeedEvents], (feed) => {
  const byUser = new Map<string, SessionUserEvent[]>();
  for (const event of feed) {
    const existing = byUser.get(event.userId);
    if (existing) {
      existing.push(event);
    } else {
      byUser.set(event.userId, [event]);
    }
  }

  const recordsByEvent = new Map<string, PersonalRecord[]>();

  for (const events of byUser.values()) {
    const ordered = [...events].sort((a, b) => a.session.date.compareTo(b.session.date));
    const bySessionId = findPersonalRecords(ordered.map((x) => x.session));

    for (const event of ordered) {
      const records = bySessionId.get(event.session.id);
      if (records) {
        recordsByEvent.set(event.eventId, records);
      }
    }
  }

  return recordsByEvent;
});

export const selectFriendActivityOnDate = createSelector(
  [selectFeedEventsByDate, selectFollowedUserNames, (_: RootState, date: LocalDate) => date],
  (feedEvents, names, date) =>
    (feedEvents.get(date.toString()) ?? []).map((event) => ({
      event,
      name: names.get(event.userId),
    })),
);
