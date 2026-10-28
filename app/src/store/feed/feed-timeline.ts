import { LocalDate, ZoneId } from '@js-joda/core';
import {
  FEED_EVENT_RETENTION_DAYS,
  FEED_EVENT_RETENTION_SECONDS,
  FeedIdentity,
  FeedUserEvent,
  SessionUserEvent,
} from '@/models/feed-models';
import { Session } from '@/models/session-models';

function sortTime(item: FeedUserEvent) {
  return item.type === 'SessionUserEvent'
    ? item.session.date.atStartOfDay().atZone(ZoneId.systemDefault()).toInstant()
    : item.timestamp;
}

export function compareFeedItems(a: FeedUserEvent, b: FeedUserEvent) {
  return sortTime(b).compareTo(sortTime(a)) || b.timestamp.compareTo(a.timestamp);
}

export function ownFeedHorizon(today: LocalDate) {
  return today.minusDays(FEED_EVENT_RETENTION_DAYS);
}

export function ownFeedItem(identity: FeedIdentity, session: Session): SessionUserEvent {
  const timestamp =
    session.lastExercise?.latestTime?.toInstant() ??
    session.finishedAt?.toInstant() ??
    session.date.atStartOfDay().atZone(ZoneId.systemDefault()).toInstant();
  return new SessionUserEvent(
    identity.id,
    session.id,
    timestamp,
    timestamp.plusSeconds(FEED_EVENT_RETENTION_SECONDS),
    identity.publishBodyweight ? session : session.with({ bodyweight: undefined }),
  );
}

export function feedTimeline(
  friendItems: SessionUserEvent[],
  identity: FeedIdentity | undefined,
  ownSessions: Session[],
): SessionUserEvent[] {
  if (!identity) {
    return friendItems;
  }
  const own = identity.publishWorkouts ? ownSessions.map((x) => ownFeedItem(identity, x)) : [];
  return [...friendItems.filter((x) => x.userId !== identity.id), ...own].sort(compareFeedItems);
}
