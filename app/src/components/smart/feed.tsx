import CardActions from '@/components/presentation/foundation/card-actions';
import { PersonAvatar } from '@/components/presentation/feed/person-avatar';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import { Remote } from '@/components/presentation/foundation/remote';
import SessionSummary from '@/components/presentation/summary/session-summary';
import SessionSummaryTitle from '@/components/presentation/summary/session-summary-title';
import SplitCardControl from '@/components/presentation/foundation/split-card-control';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { getFeedItemHref } from '@/components/smart/feed-item';
import { getFeedProfileEditorHref } from '@/components/smart/feed-profile-editor';
import { FeedWeekStrip } from '@/components/smart/feed-week-strip';
import { ReactionBar } from '@/components/smart/reaction-bar';
import { ReactionSummary } from '@/components/smart/reaction-summary';
import { PrBadges } from '@/components/smart/pr-badges';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScrollListener';
import { FeedIdentity, SessionUserEvent } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { shareString } from '@/store/app';
import {
  fetchFeedItems,
  fetchInboxItems,
  getFeedShareUrl,
  selectFeedFollowers,
  selectFeedFollowing,
  selectFeedIdentityRemote,
  selectFeedSessionItems,
  selectOwnFeedUserId,
} from '@/store/feed';
import { T, useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Card } from 'react-native-paper';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import { useDispatch } from 'react-redux';
import { LegendList, LegendListRef } from '@legendapp/list';
import { useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Feed() {
  const feedItems = useAppSelector(selectFeedSessionItems);
  const { handleScroll } = useScroll();
  const fetchingFeedItems = useAppSelector((x) => x.feed.isFetching);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const listRef = useRef<LegendListRef>(null);
  const itemSignature = feedItems.map((x) => x.eventId).join(',');

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [itemSignature]);

  return (
    <LegendList
      ref={listRef}
      testID="feed-list"
      maintainVisibleContentPosition={false}
      ListHeaderComponent={<FeedProfileHeader />}
      onRefresh={() => {
        dispatch(fetchInboxItems({ fromUserAction: true }));
        dispatch(fetchFeedItems({ fromUserAction: true }));
      }}
      ListEmptyComponent={
        <EmptyInfo style={{ marginTop: spacing[8] }}>
          <T keyName="feed.no_following_data.message" />
        </EmptyInfo>
      }
      refreshing={fetchingFeedItems}
      onScroll={handleScroll}
      data={feedItems}
      keyExtractor={(x) => x.eventId}
      renderItem={({ item }) => <FeedItemRenderer feedItem={item} />}
      ItemSeparatorComponent={() => <View style={{ height: spacing[2] }}></View>}
      contentContainerStyle={{
        padding: spacing.pageHorizontalMargin,
        paddingBottom: insets.bottom,
      }}
    />
  );
}

function FeedProfileHeader() {
  const identityRemote = useAppSelector(selectFeedIdentityRemote);

  return (
    <>
      <Remote value={identityRemote} success={(identity) => <FeedProfile identity={identity} />} />
      <FeedWeekStrip />
    </>
  );
}

function FeedProfile({ identity }: { identity: FeedIdentity }) {
  const dispatch = useDispatch();
  const { push } = useRouter();
  const following = useAppSelector(selectFeedFollowing);
  const followers = useAppSelector(selectFeedFollowers);
  const shareUrl = getFeedShareUrl(identity);
  const isAlone = following.length === 0 && followers.length === 0;

  return (
    <>
      <View
        style={{ display: 'none' }}
        testID="share-url"
        // @ts-expect-error -- This only works on web, ignored elsewhere
        dataSet={{ shareUrl }}
      />

      {identity.publishWorkouts ? undefined : (
        <Card mode="contained" style={{ marginBottom: spacing[2] }}>
          <Card.Content
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: spacing[2],
            }}
          >
            <SurfaceText color="error">
              <T keyName="feed.not_publishing_workouts.error" />
            </SurfaceText>
            <Button
              style={{ marginLeft: 'auto' }}
              testID="feed-fix-button"
              onPress={() => push(getFeedProfileEditorHref({ focusPublish: true }))}
              mode="outlined"
            >
              <T keyName="generic.fix.button" />
            </Button>
          </Card.Content>
        </Card>
      )}

      {isAlone && (
        <Card mode="contained" style={{ marginBottom: spacing[2] }}>
          <Card.Content style={{ gap: spacing[2] }}>
            <SurfaceText>
              <T keyName="feed.explanation.body" />
            </SurfaceText>
          </Card.Content>
          <CardActions>
            <Button
              testID="feed-share-button"
              mode="contained"
              icon={'share'}
              onPress={() => {
                dispatch(
                  shareString({
                    title: 'Share feed profile',
                    value: shareUrl,
                  }),
                );
              }}
            >
              <T keyName="generic.share.button" />
            </Button>
          </CardActions>
        </Card>
      )}
    </>
  );
}

function FeedItemRenderer(props: { feedItem: SessionUserEvent }) {
  const users = useAppSelector(selectFeedFollowing);
  const ownUserId = useAppSelector(selectOwnFeedUserId);
  const identity = useAppSelector((x) => x.feed.identity.unwrapOr(undefined));
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const { push } = useRouter();
  const isOwnItem = props.feedItem.userId === ownUserId;
  switch (props.feedItem.type) {
    case 'SessionUserEvent': {
      const authorName = isOwnItem ? identity?.name : users.find((x) => x.userId === props.feedItem.userId)?.user.name;
      const byline = isOwnItem ? t('feed.you.label') : (authorName ?? t('feed.anonymous_user.label'));
      return (
        <Card mode="contained" testID="feed-view-workout" onPress={() => push(getFeedItemHref(props.feedItem.eventId))}>
          <Card.Content>
            <SplitCardControl
              titleContent={
                <SessionSummaryTitle
                  showDate
                  showVolume
                  byline={byline}
                  bylineLeading={<PersonAvatar userId={props.feedItem.userId} name={authorName} size={24} />}
                  session={props.feedItem.session}
                />
              }
              mainContent={
                <View style={{ gap: spacing[2] }}>
                  <SessionSummary session={props.feedItem.session} isFilled showWeight />
                  <PrBadges eventId={props.feedItem.eventId} />
                </View>
              }
            />
            <View
              style={{
                marginTop: spacing[3],
                paddingTop: spacing[3],
                borderTopWidth: 1,
                borderTopColor: colors.outlineVariant,
              }}
            >
              {isOwnItem ? (
                <ReactionSummary compact eventId={props.feedItem.eventId} animateOnMount />
              ) : (
                <ReactionBar eventId={props.feedItem.eventId} animateOnMount />
              )}
            </View>
          </Card.Content>
        </Card>
      );
    }
    default:
      return undefined;
  }
}
