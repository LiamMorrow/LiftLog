import { LocalDate } from '@js-joda/core';

/** 0 means "no session". A session always grades at least 1, however little volume it moved. */
export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

export const MAX_ACTIVITY_LEVEL = 4;

/** The graded levels, lightest to heaviest. Level 0 is absence, so it has nothing to show in a key. */
export const ACTIVITY_LEVELS = [1, 2, 3, 4] as const satisfies ActivityLevel[];

export interface ActivityMarker {
  userId: string;
  name: string | undefined;
  eventId: string;
}

export interface ActivityCell {
  date: LocalDate;
  level: ActivityLevel;
  sessionCount: number;
  markers: ActivityMarker[];
  overflowMarkers: number;
  isToday: boolean;
  isFuture: boolean;
  /** An adjacent-month day padding out the first/last week-line. */
  isOutsideFocus: boolean;
  /**
   * Older than the feed retention window, so followed users' sessions are *unknown* rather than absent.
   * Callers must render no marker slot at all, or expired data reads as "they didn't train".
   */
  isBeyondFeedHorizon: boolean;
}

export interface ActivityRow {
  key: string;
  label?: string;
  cells: ActivityCell[];
}

/**
 * The volume range a user's days are graded against, as the 10th/90th percentile of their whole history.
 * Percentiles rather than min/max so a single PR day doesn't wash out the year and a deload doesn't read as
 * nothing.
 */
export interface VolumeScale {
  lo: number;
  hi: number;
}
