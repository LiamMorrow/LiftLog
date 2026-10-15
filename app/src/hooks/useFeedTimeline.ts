import { readSessionsBetween } from '@/db/sessions';
import { useSessionsQuery } from '@/hooks/useSessionsQuery';
import { useToday } from '@/hooks/useToday';
import { SessionUserEvent } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { selectFeedSessionItems } from '@/store/feed';
import { feedTimeline, ownFeedHorizon } from '@/store/feed/feed-timeline';

export function useFeedTimeline(): SessionUserEvent[] {
  const friendItems = useAppSelector(selectFeedSessionItems);
  const identity = useAppSelector((x) => x.feed.identity.unwrapOr(undefined));
  const today = useToday();
  const publishWorkouts = !!identity?.publishWorkouts;
  const ownSessions = useSessionsQuery(
    (db) => (publishWorkouts ? readSessionsBetween(db, ownFeedHorizon(today), today) : []),
    `${publishWorkouts}:${today.toString()}`,
  );

  return feedTimeline(friendItems, identity, ownSessions ?? []);
}
