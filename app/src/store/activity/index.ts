import { createSelector } from '@reduxjs/toolkit';
import { LocalDate, YearMonth } from '@js-joda/core';
import { Session } from '@/models/session-models';
import { FEED_EVENT_RETENTION_DAYS, SessionUserEvent } from '@/models/feed-models';
import { RootState } from '@/store/store';
import { selectSessions } from '@/store/stored-sessions';
import { ActivityCell, ActivityMarker, ActivityRow, VolumeScale } from '@/store/activity/activity-types';
import { levelFor, sessionVolume, volumeScaleOf } from '@/store/activity/volume';
import { calculateStreak } from '@/store/activity/streak';

export * from '@/store/activity/activity-types';
export * from '@/store/activity/volume';
export * from '@/store/activity/streak';
export * from '@/store/activity/week-start';

/** Identifies the current user's own row/scale, which has no feed userId of its own. */
export const OWN_USER_KEY = 'me';

/** How many friend markers fit under a day number before we collapse the rest into a "+N" dot. */
const MAX_MARKERS_PER_CELL = 3;

const selectAllFeedEvents = (state: RootState) => state.feed.feed;
const selectFollowedUsers = (state: RootState) => state.feed.followedUsers;
const selectFirstDayOfWeek = (state: RootState) => state.settings.firstDayOfWeek;
const selectOwnFeedUserId = (state: RootState) => state.feed.identity.unwrapOr(undefined)?.id;

/** Own activity always comes from stored sessions, so a self-follow would otherwise count everything twice. */
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

export const selectOwnSessionsByDate = createSelector([selectSessions], (sessions) =>
  groupByDate(
    Object.values(sessions).filter((x) => x.isStarted),
    (x) => x.date,
  ),
);

/** Keyed by the date the session was performed, not the event timestamp. */
export const selectFeedEventsByDate = createSelector([selectFeedEvents], (feed) =>
  groupByDate(
    feed.filter((x) => x.session.isStarted),
    (x) => x.session.date,
  ),
);

/** Per-user volume ranges, each normalised over that user's whole history rather than the visible month. */
export const selectVolumeScales = createSelector(
  [selectSessions, selectFeedEvents],
  (sessions, feed): Map<string, VolumeScale> => {
    const volumesByUser = new Map<string, number[]>();

    const push = (userId: string, session: Session) => {
      if (!session.isStarted) return;
      const volumes = volumesByUser.get(userId);
      if (volumes) {
        volumes.push(sessionVolume(session));
      } else {
        volumesByUser.set(userId, [sessionVolume(session)]);
      }
    };

    for (const session of Object.values(sessions)) {
      push(OWN_USER_KEY, session);
    }
    for (const event of feed) {
      push(event.userId, event.session);
    }

    return new Map([...volumesByUser].map(([userId, volumes]) => [userId, volumeScaleOf(volumes)]));
  },
);

function markersFor(events: SessionUserEvent[], names: Map<string, string | undefined>) {
  const markers: ActivityMarker[] = events.map((event) => ({
    userId: event.userId,
    name: names.get(event.userId),
    eventId: event.eventId,
  }));

  return {
    markers: markers.slice(0, MAX_MARKERS_PER_CELL),
    overflowMarkers: Math.max(0, markers.length - MAX_MARKERS_PER_CELL),
  };
}

const selectFollowedUserNames = createSelector(
  [selectFollowedUsers],
  (followedUsers) => new Map(Object.entries(followedUsers).map(([userId, user]) => [userId, user.name])),
);

/** Self-follows don't count: they contribute no activity that isn't already yours. */
export const selectFollowsOtherUsers = createSelector(
  [selectFollowedUsers, selectOwnFeedUserId],
  (followedUsers, ownUserId) => Object.keys(followedUsers).some((userId) => userId !== ownUserId),
);

interface CellContext {
  ownSessions: Map<string, Session[]>;
  feedEvents: Map<string, SessionUserEvent[]>;
  scales: Map<string, VolumeScale>;
  names: Map<string, string | undefined>;
  today: LocalDate;
  horizon: LocalDate;
}

function buildCell(
  date: LocalDate,
  context: CellContext,
  options: { isOutsideFocus: boolean; includeMarkers: boolean },
): ActivityCell {
  const key = date.toString();
  const sessions = context.ownSessions.get(key) ?? [];
  const scale = context.scales.get(OWN_USER_KEY);

  const volume = sessions.reduce((total, session) => total + sessionVolume(session), 0);

  const isBeyondFeedHorizon = date.isBefore(context.horizon);
  const events = options.includeMarkers && !isBeyondFeedHorizon ? (context.feedEvents.get(key) ?? []) : [];
  const { markers, overflowMarkers } = markersFor(events, context.names);

  return {
    date,
    level: sessions.length === 0 || !scale ? 0 : levelFor(volume, scale),
    sessionCount: sessions.length,
    markers,
    overflowMarkers,
    isToday: date.isEqual(context.today),
    isFuture: date.isAfter(context.today),
    isOutsideFocus: options.isOutsideFocus,
    isBeyondFeedHorizon,
  };
}

const selectCellContext = createSelector(
  [selectOwnSessionsByDate, selectFeedEventsByDate, selectVolumeScales, selectFollowedUserNames],
  (ownSessions, feedEvents, scales, names) => ({ ownSessions, feedEvents, scales, names }),
);

export interface ActivityMonthParams {
  yearMonth: YearMonth;
  today: LocalDate;
}

export interface ActivityMonth {
  rows: ActivityRow[];
  /** True when the month reaches past the feed horizon *and* there is friend data that could have been lost. */
  crossesFeedHorizon: boolean;
}

/** `today` is an argument rather than read from the clock, so memoization can't go stale across midnight. */
export const selectActivityMonth = createSelector(
  [
    selectCellContext,
    selectFirstDayOfWeek,
    selectFollowsOtherUsers,
    (_: RootState, params: ActivityMonthParams) => params.yearMonth,
    (_: RootState, params: ActivityMonthParams) => params.today,
  ],
  (cellContext, firstDayOfWeek, followsOthers, yearMonth, today): ActivityMonth => {
    const context = withHorizon(cellContext, today);
    const firstOfMonth = LocalDate.of(yearMonth.year(), yearMonth.monthValue(), 1);

    const leadingDays = (firstOfMonth.dayOfWeek().value() - firstDayOfWeek.value() + 7) % 7;
    const trailingDays = (7 - ((leadingDays + yearMonth.lengthOfMonth()) % 7)) % 7;
    const totalDays = leadingDays + yearMonth.lengthOfMonth() + trailingDays;

    const cells = Array.from({ length: totalDays }, (_, index) => {
      const date = firstOfMonth.plusDays(index - leadingDays);
      return buildCell(date, context, {
        isOutsideFocus: index < leadingDays || index >= leadingDays + yearMonth.lengthOfMonth(),
        includeMarkers: true,
      });
    });

    const rows: ActivityRow[] = [];
    for (let start = 0; start < cells.length; start += 7) {
      rows.push({ key: `week-${start / 7}`, cells: cells.slice(start, start + 7) });
    }

    return {
      rows,
      crossesFeedHorizon: firstOfMonth.isBefore(context.horizon) && followsOthers,
    };
  },
);

function withHorizon(context: Omit<CellContext, 'today' | 'horizon'>, today: LocalDate): CellContext {
  return { ...context, today, horizon: today.minusDays(FEED_EVENT_RETENTION_DAYS) };
}

/** The seven days ending on `today`, as one row per user — you first, then whoever else trained. */
export const selectActivityWeek = createSelector(
  [selectCellContext, selectFollowedUserNames, (_: RootState, today: LocalDate) => today],
  (cellContext, names, today): ActivityRow[] => {
    const context = withHorizon(cellContext, today);
    const days = Array.from({ length: 7 }, (_, index) => today.minusDays(6 - index));

    const ownRow: ActivityRow = {
      key: OWN_USER_KEY,
      cells: days.map((date) => buildCell(date, context, { isOutsideFocus: false, includeMarkers: false })),
    };

    const userIdsWithActivity = new Set(
      days.flatMap((date) => (context.feedEvents.get(date.toString()) ?? []).map((event) => event.userId)),
    );

    const friendRows = [...userIdsWithActivity].map((userId): ActivityRow => {
      const scale = context.scales.get(userId);
      return {
        key: userId,
        label: names.get(userId),
        cells: days.map((date) => {
          const events = (context.feedEvents.get(date.toString()) ?? []).filter((event) => event.userId === userId);
          const volume = events.reduce((total, event) => total + sessionVolume(event.session), 0);

          return {
            date,
            level: events.length === 0 || !scale ? 0 : levelFor(volume, scale),
            sessionCount: events.length,
            markers: [],
            overflowMarkers: 0,
            isToday: date.isEqual(today),
            isFuture: false,
            isOutsideFocus: false,
            isBeyondFeedHorizon: false,
          } satisfies ActivityCell;
        }),
      };
    });

    return [ownRow, ...friendRows];
  },
);

export const selectStreakStats = createSelector(
  [selectSessions, selectFirstDayOfWeek, (_: RootState, today: LocalDate) => today],
  (sessions, firstDayOfWeek, today) => calculateStreak(Object.values(sessions), firstDayOfWeek, today),
);

export const selectFriendActivityOnDate = createSelector(
  [selectFeedEventsByDate, selectFollowedUserNames, (_: RootState, date: LocalDate) => date],
  (feedEvents, names, date) =>
    (feedEvents.get(date.toString()) ?? []).map((event) => ({
      event,
      name: names.get(event.userId),
    })),
);

