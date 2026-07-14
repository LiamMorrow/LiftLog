import EmptyInfo from '@/components/presentation/foundation/empty-info';
import { PersonAvatar } from '@/components/presentation/feed/person-avatar';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import SessionComponent from '@/components/smart/session-component';
import { ReactionBar } from '@/components/smart/reaction-bar';
import { ReactionSummary } from '@/components/smart/reaction-summary';
import { FeedPrBadges } from '@/components/smart/pr-badges';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useAppSelector } from '@/store';
import { setCurrentSession } from '@/store/current-session';
import { selectFeedFollowing, selectFeedSessionItems, selectOwnFeedUserId } from '@/store/feed';
import { T, useTranslate } from '@tolgee/react';
import { LocalDate } from '@js-joda/core';
import { Href, Stack } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Card } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export function getFeedItemHref(eventId: string): Href {
  return `/feed/item/${encodeURIComponent(eventId)}` as Href;
}

export function FeedItem({ eventId }: { eventId: string }) {
  const dispatch = useDispatch();
  const { colors } = useAppTheme();
  const feedItem = useAppSelector(selectFeedSessionItems).find((x) => x.eventId === eventId);
  const users = useAppSelector(selectFeedFollowing);
  const ownUserId = useAppSelector(selectOwnFeedUserId);
  const identity = useAppSelector((x) => x.feed.identity.unwrapOr(undefined));
  const showBodyweight = useAppSelector((x) => x.settings.showBodyweight);
  const formatDate = useFormatDate();
  const { t } = useTranslate();
  const session = feedItem?.session;

  useEffect(() => {
    dispatch(setCurrentSession({ target: 'feedSession', session }));
  }, [dispatch, session]);

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
  const authorName = isOwnItem ? identity?.name : users.find((x) => x.userId === feedItem.userId)?.user.name;
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
        target="feedSession"
        showBodyweight={showBodyweight && !!session.bodyweight}
        header={
          <Card mode="contained" style={{ margin: spacing.pageHorizontalMargin }}>
            <Card.Content>
              <View style={{ gap: spacing[2] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
                  <PersonAvatar userId={feedItem.userId} name={authorName} size={40} />
                  <View style={{ gap: spacing[1], flexShrink: 1 }}>
                    <SurfaceText>
                      <SurfaceText weight="bold">{userName}</SurfaceText> completed a workout
                    </SurfaceText>
                    <SurfaceText font="text-sm" color="onSurfaceVariant">
                      {formattedDate}
                    </SurfaceText>
                  </View>
                </View>
                <FeedPrBadges eventId={feedItem.eventId} />
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
