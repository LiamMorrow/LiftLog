import { createSelector } from '@reduxjs/toolkit';
import { LocalDate, YearMonth } from '@js-joda/core';
import { FEED_EVENT_RETENTION_DAYS, SessionUserEvent } from '@/models/feed-models';
import { RootState } from '@/store/store';
import { ActivityCell, ActivityMarker, ActivityRow, VolumeScale } from '@/store/activity/activity-types';
import { levelFor, sessionVolume, volumeScaleOf } from '@/store/activity/volume';
import { DayActivity, OwnHistory } from '@/store/activity/own-history';
import { findPersonalRecords, PersonalRecord } from '@/store/stats/personal-records';

export * from '@/store/activity/activity-types';
export * from '@/store/activity/volume';
export * from '@/store/activity/streak';
export * from '@/store/activity/week-start';
export * from '@/store/activity/own-history';

/** Identifies the current user's own row/scale, which has no feed userId of its own. */
export const OWN_USER_KEY = 'me';

/** How many friend markers fit under a day number before we collapse the rest into a "+N" dot. */
const MAX_MARKERS_PER_CELL = 3;

const selectAllFeedEvents = (state: RootState) => state.feed.feed;
const selectFollowedUsers = (state: RootState) => state.feed.followedUsers;
const selectFirstDayOfWeek = (state: RootState) => state.settings.firstDayOfWeek;
const selectOwnFeedUserId = (state: RootState) => state.feed.identity.unwrapOr(undefined)?.id;

/** Own activity always comes from your own history, so a self-follow would otherwise count everything twice. */
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
  own: OwnHistory;
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
  const day = context.own.days.get(key) ?? noActivity;
  const scale = context.own.volumeScale;

  const isBeyondFeedHorizon = date.isBefore(context.horizon);
  const events = options.includeMarkers && !isBeyondFeedHorizon ? (context.feedEvents.get(key) ?? []) : [];
  const { markers, overflowMarkers } = markersFor(events, context.names);

  return {
    date,
    level: day.sessionCount === 0 || !scale ? 0 : levelFor(day.volume, scale),
    sessionCount: day.sessionCount,
    markers,
    overflowMarkers,
    isToday: date.isEqual(context.today),
    isFuture: date.isAfter(context.today),
    isOutsideFocus: options.isOutsideFocus,
    isBeyondFeedHorizon,
  };
}

const noActivity: DayActivity = { sessionCount: 0, volume: 0 };

const selectFeedCellContext = createSelector(
  [selectFeedEventsByDate, selectFeedVolumeScales, selectFollowedUserNames],
  (feedEvents, scales, names) => ({ feedEvents, scales, names }),
);

export interface ActivityWeekParams {
  today: LocalDate;
  own: OwnHistory;
}

export interface ActivityMonthParams extends ActivityWeekParams {
  yearMonth: YearMonth;
}

export interface ActivityMonth {
  rows: ActivityRow[];
  /** True when the month reaches past the feed horizon *and* there is friend data that could have been lost. */
  crossesFeedHorizon: boolean;
}

/** `today` is an argument rather than read from the clock, so memoization can't go stale across midnight. */
export const selectActivityMonth = createSelector(
  [
    selectFeedCellContext,
    selectFirstDayOfWeek,
    selectFollowsOtherUsers,
    (_: RootState, params: ActivityMonthParams) => params.yearMonth,
    (_: RootState, params: ActivityMonthParams) => params.today,
    (_: RootState, params: ActivityMonthParams) => params.own,
  ],
  (feedContext, firstDayOfWeek, followsOthers, yearMonth, today, own): ActivityMonth => {
    const context = withHorizon({ ...feedContext, own }, today);
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

/** The seven days ending on `today`, as one row per user - you first, then whoever else trained. */
export const selectActivityWeek = createSelector(
  [
    selectFeedCellContext,
    selectFollowedUserNames,
    (_: RootState, params: ActivityWeekParams) => params.today,
    (_: RootState, params: ActivityWeekParams) => params.own,
  ],
  (feedContext, names, today, own): ActivityRow[] => {
    const context = withHorizon({ ...feedContext, own }, today);
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

export interface FollowingActivity {
  cells: ActivityCell[];
  workoutsThisWeek: number;
  /** Absent when they have published nothing inside the retention window -- not when they have never trained. */
  lastWorkoutDate?: LocalDate;
}

/**
 * One seven-day row per followed user, including the ones who have gone quiet -- `selectActivityWeek` drops
 * those, but the Following tab has to say something about them, so they get a row of empty cells instead.
 *
 * A self-follow reads from your own history rather than the feed: your own events are filtered out of the
 * feed to stop them being counted twice, so sourcing this row from there would report you as never having
 * trained.
 */
export const selectFollowingActivity = createSelector(
  [
    selectFeedEventsByDate,
    selectFeedVolumeScales,
    selectFollowedUsers,
    selectOwnFeedUserId,
    (_: RootState, params: ActivityWeekParams) => params.today,
    (_: RootState, params: ActivityWeekParams) => params.own,
  ],
  (feedEvents, scales, followedUsers, ownUserId, today, own): Map<string, FollowingActivity> => {
    const days = Array.from({ length: 7 }, (_, index) => today.minusDays(6 - index));

    return new Map(
      Object.keys(followedUsers).map((userId) => {
        const isOwn = userId === ownUserId;
        const scale = isOwn ? own.volumeScale : scales.get(userId);

        const activityOn = (date: LocalDate): DayActivity => {
          if (isOwn) {
            return own.days.get(date.toString()) ?? noActivity;
          }
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
            markers: [],
            overflowMarkers: 0,
            isToday: date.isEqual(today),
            isFuture: false,
            isOutsideFocus: false,
            isBeyondFeedHorizon: false,
          };
        });

        const lastWorkoutDate = [...(isOwn ? own.days : feedEvents).keys()]
          .map((date) => LocalDate.parse(date))
          .filter((date) => activityOn(date).sessionCount > 0)
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
