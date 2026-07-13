import CardActions from '@/components/presentation/foundation/card-actions';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import { Remote } from '@/components/presentation/foundation/remote';
import SessionSummary from '@/components/presentation/summary/session-summary';
import SessionSummaryTitle from '@/components/presentation/summary/session-summary-title';
import SplitCardControl from '@/components/presentation/foundation/split-card-control';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { getFeedItemHref } from '@/components/smart/feed-item';
import { getFeedProfileEditorHref } from '@/components/smart/feed-profile-editor';
import { FeedWeekStrip } from '@/components/smart/feed-week-strip';
import { spacing } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScrollListener';
import { FeedIdentity, SessionUserEvent } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { shareString } from '@/store/app';
import {
  fetchFeedItems,
  fetchInboxItems,
  selectFeedFollowing,
  selectFeedIdentityRemote,
  selectFeedSessionItems,
} from '@/store/feed';
import { T, useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Card, Icon } from 'react-native-paper';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import { useDispatch } from 'react-redux';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
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
  const shareUrl = `https://app.liftlog.online/feed/share?id=${identity.lookup}${
    identity.name ? `&name=${encodeURIComponent(identity.name)}` : ''
  }`;
  const { t } = useTranslate();
  return (
    <>
      <Card mode="contained" style={{ marginBottom: spacing[2] }}>
        <Card.Title
          left={({ size }) => <Icon source={'personFill'} size={size} />}
          title={t('feed.profile.title')}
          titleVariant="headlineSmall"
        />
        <Card.Content>
          <View
            style={{ display: 'none' }}
            testID="share-url"
            // @ts-expect-error -- This only works on web, ignored elsewhere
            dataSet={{ shareUrl }}
          />
          <SurfaceText>
            <T keyName="feed.explanation.body" />
          </SurfaceText>

          {identity.publishWorkouts ? undefined : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
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
            </View>
          )}
        </Card.Content>

        <CardActions>
          <IconButton mode="contained" icon={'edit'} onPress={() => push(getFeedProfileEditorHref())} />
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
    </>
  );
}

function FeedItemRenderer(props: { feedItem: SessionUserEvent }) {
  const users = useAppSelector(selectFeedFollowing);
  const { push } = useRouter();
  switch (props.feedItem.type) {
    case 'SessionUserEvent':
      return (
        <Card mode="contained">
          <Card.Content>
            <SplitCardControl
              titleContent={<SessionSummaryTitle showDate session={props.feedItem.session} />}
              mainContent={
                <View style={{ gap: spacing[2] }}>
                  <SessionSummary session={props.feedItem.session} isFilled showWeight />
                  <SurfaceText>
                    <SurfaceText weight={'bold'}>
                      {users.find((x) => x.userId === props.feedItem.userId)?.user.name ?? 'Anonymous user'}
                    </SurfaceText>{' '}
                    completed a workout
                  </SurfaceText>
                </View>
              }
            />
          </Card.Content>
          <CardActions style={{ marginTop: spacing[2] }}>
            <Button
              testID="feed-view-workout"
              mode="contained"
              icon={'visibility'}
              onPress={() => push(getFeedItemHref(props.feedItem.eventId))}
            >
              <T keyName="feed.view_workout.button" />
            </Button>
          </CardActions>
        </Card>
      );
    default:
      return undefined;
  }
}
