import EmptyInfo from '@/components/presentation/foundation/empty-info';
import { PersonAvatar } from '@/components/presentation/feed/person-avatar';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import SessionComponent from '@/components/smart/session-component';
import { ReactionBar } from '@/components/smart/reaction-bar';
import { ReactionSummary } from '@/components/smart/reaction-summary';
import { PrRecordList, useEventRecords } from '@/components/smart/pr-badges';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useFeedTimeline } from '@/hooks/useFeedTimeline';
import { useFeedHubLease } from '@/hooks/useFeedHubLease';
import { useLiveLabel } from '@/hooks/useLiveLabel';
import { LiveChip } from '@/components/presentation/feed/live-chip';
import { LiveSessionUserEvent } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { selectLiveSessions, selectOwnFeedUserId } from '@/store/feed';
import { T, useTranslate } from '@tolgee/react';
import { LocalDate } from '@js-joda/core';
import { Href, Stack } from 'expo-router';
import { View } from 'react-native';
import { Card } from 'react-native-paper';

export function getFeedItemHref(eventId: string): Href {
  return `/feed/item/${encodeURIComponent(eventId)}`;
}

export function FeedItem({ eventId }: { eventId: string }) {
  const { colors } = useAppTheme();
  const finishedItem = useFeedTimeline().find((x) => x.eventId === eventId);
  const liveItem = useAppSelector(selectLiveSessions).find((x) => x.eventId === eventId);
  const feedItem = finishedItem ?? liveItem;
  useFeedHubLease('viewer', true);
  const friends = useAppSelector((x) => x.feed.friends);
  const ownUserId = useAppSelector(selectOwnFeedUserId);
  const identity = useAppSelector((x) => x.feed.identity.unwrapOr(undefined));
  const showBodyweight = useAppSelector((x) => x.settings.showBodyweight);
  const formatDate = useFormatDate();
  const { t } = useTranslate();
  const session = feedItem?.session;
  const records = useEventRecords(eventId, feedItem?.userId === ownUserId);

  if (!feedItem || !session) {
    return (
      <>
        <Stack.Screen options={{ title: '' }} />
        <EmptyInfo style={{ marginTop: spacing[8] }}>
          <T keyName="feed.item_unavailable.message" />
        </EmptyInfo>
      </>
    );
  }

  const isOwnItem = feedItem.userId === ownUserId;
  const authorName = isOwnItem ? identity?.name : friends[feedItem.userId]?.name;
  const userName = isOwnItem ? t('feed.you.label') : (authorName ?? t('feed.anonymous_user.label'));
  const formattedDate = formatDate(session.date, {
    year: session.date.year() !== LocalDate.now().year() ? 'numeric' : undefined,
    day: 'numeric',
    weekday: 'long',
    month: 'long',
  });

  return (
    <>
      <Stack.Screen options={{ title: session.blueprint.name }} />
      <SessionComponent
        session={session}
        showBodyweight={showBodyweight && !!session.bodyweight}
        header={
          <Card mode="contained" style={{ margin: spacing.pageHorizontalMargin }}>
            <Card.Content>
              <View style={{ gap: spacing[2] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
                  <PersonAvatar userId={feedItem.userId} name={authorName} size={40} />
                  {feedItem.type === 'LiveSessionUserEvent' ? (
                    <View style={{ gap: spacing[1], flexShrink: 1 }}>
                      <SurfaceText>
                        <SurfaceText weight="bold">{userName}</SurfaceText> {t('feed.item.training.message')}
                      </SurfaceText>
                      <LiveItemChip item={feedItem} />
                    </View>
                  ) : (
                    <View style={{ gap: spacing[1], flexShrink: 1 }}>
                      <SurfaceText>
                        <SurfaceText weight="bold">{userName}</SurfaceText> completed a workout
                      </SurfaceText>
                      <SurfaceText font="text-sm" color="onSurfaceVariant">
                        {formattedDate}
                      </SurfaceText>
                    </View>
                  )}
                </View>
                <PrRecordList {...records} />
                <View style={{ paddingTop: spacing[2], borderTopWidth: 1, borderTopColor: colors.outlineVariant }}>
                  {isOwnItem ? (
                    <ReactionSummary eventId={feedItem.eventId} animateOnMount />
                  ) : (
                    <ReactionBar eventId={feedItem.eventId} animateOnMount />
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        }
      />
    </>
  );
}

function LiveItemChip({ item }: { item: LiveSessionUserEvent }) {
  const label = useLiveLabel(item);
  return <LiveChip label={label} style={{ alignSelf: 'flex-start' }} />;
}
