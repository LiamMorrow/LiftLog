import CardActions from '@/components/presentation/foundation/card-actions';
import { Card, CardContent } from '@/components/presentation/foundation/card';
import { PersonAvatar } from '@/components/presentation/feed/person-avatar';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import { Remote } from '@/components/presentation/foundation/remote';
import SessionSummary from '@/components/presentation/summary/session-summary';
import SessionSummaryTitle from '@/components/presentation/summary/session-summary-title';
import SplitCardControl from '@/components/presentation/foundation/split-card-control';
import { AppText } from '@/components/presentation/foundation/app-text';
import { CreateFeedAccountCard } from '@/components/smart/create-feed-account-card';
import { getFeedItemHref } from '@/components/smart/feed-item';
import { getFeedSettingsHref } from '@/components/smart/feed-settings';
import { FeedWeekStrip } from '@/components/smart/feed-week-strip';
import { TrainingNow } from '@/components/smart/training-now';
import { ReactionBar } from '@/components/smart/reaction-bar';
import { ReactionSummary } from '@/components/smart/reaction-summary';
import { PrStrip, useEventRecords } from '@/components/smart/pr-badges';
import { spacing } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScrollListener';
import { useFeedTimeline } from '@/hooks/useFeedTimeline';
import { FeedIdentity, SessionUserEvent } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { shareString } from '@/store/app';
import {
  fetchInboxItems,
  getFeedShareUrl,
  selectFeedIdentityRemote,
  selectFriendList,
  selectOwnFeedUserId,
} from '@/store/feed';
import { T, useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { NativeButton } from '@/components/presentation/foundation/native-button';
import ShareIcon from '@expo/material-symbols/share.xml';
import { useDispatch } from 'react-redux';
import { LegendList, LegendListRef } from '@legendapp/list/react-native';
import { useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeIconButton } from '@/components/presentation/foundation/native-icon-button';
import OpenInNewIcon from '@expo/material-symbols/open_in_new.xml';

export default function Feed() {
  const feedItems = useFeedTimeline();
  const { handleScroll } = useScroll();
  const fetchingFeedItems = useAppSelector((x) => x.feed.isFetching);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const listRef = useRef<LegendListRef>(null);
  const hasAccount = useAppSelector(selectFeedIdentityRemote).isSuccess();
  const itemSignature = feedItems.map((x) => x.eventId).join(',');

  useEffect(() => {
    void listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [itemSignature]);

  return (
    <LegendList
      ref={listRef}
      testID="feed-list"
      maintainVisibleContentPosition={false}
      ListHeaderComponent={<FeedProfileHeader />}
      onRefresh={() => {
        dispatch(fetchInboxItems({ fromUserAction: true }));
      }}
      ListEmptyComponent={
        hasAccount ? (
          <EmptyInfo style={{ marginTop: spacing[8] }}>
            <T keyName="feed.no_friend_workouts.message" />
          </EmptyInfo>
        ) : undefined
      }
      refreshing={fetchingFeedItems}
      onScroll={handleScroll}
      data={feedItems}
      keyExtractor={(x) => x.eventId}
      recycleItems
      renderItem={({ item }) => <FeedItemRenderer feedItem={item} />}
      ItemSeparatorComponent={() => <View style={{ height: spacing[2] }}></View>}
      contentContainerStyle={{
        paddingHorizontal: spacing.pageHorizontalMargin,
        paddingTop: spacing.pageVerticalMargin,
        paddingBottom: insets.bottom + spacing.pageVerticalMargin,
      }}
    />
  );
}

function FeedProfileHeader() {
  const identityRemote = useAppSelector(selectFeedIdentityRemote);
  const createAccount = () => <CreateFeedAccountCard />;

  return (
    <Remote
      value={identityRemote}
      notAsked={createAccount}
      loading={createAccount}
      error={createAccount}
      success={(identity) => (
        <>
          <FeedProfile identity={identity} />
          <TrainingNow />
          <FeedWeekStrip />
        </>
      )}
    />
  );
}

function FeedProfile({ identity }: { identity: FeedIdentity }) {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { push } = useRouter();
  const friends = useAppSelector(selectFriendList);
  const shareUrl = getFeedShareUrl(identity);
  const isAlone = friends.length === 0;

  return (
    <>
      <View
        style={{ display: 'none' }}
        testID="share-url"
        // @ts-expect-error -- This only works on web, ignored elsewhere
        dataSet={{ shareUrl }}
      />

      {identity.publishWorkouts ? undefined : (
        <Card style={{ marginBottom: spacing[2] }}>
          <CardContent
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: spacing[2],
            }}
          >
            <AppText variant="bodyLarge" color="error">
              <T keyName="feed.not_publishing_workouts.error" />
            </AppText>
            <NativeButton
              variant="outlined"
              style={{ marginLeft: 'auto' }}
              testID="feed-fix-button"
              label={t('generic.fix.button')}
              onPress={() => push(getFeedSettingsHref({ focus: 'publish' }))}
            />
          </CardContent>
        </Card>
      )}

      {isAlone && (
        <Card style={{ marginBottom: spacing[2] }}>
          <CardContent style={{ gap: spacing[2], paddingBottom: 0 }}>
            <AppText variant="bodyLarge">
              <T keyName="feed.friends_explanation.body" />
            </AppText>
          </CardContent>
          <CardActions>
            <NativeButton
              testID="feed-share-button"
              icon={ShareIcon}
              systemImage="square.and.arrow.up"
              label={t('generic.share.button')}
              onPress={() => {
                dispatch(
                  shareString({
                    title: 'Share feed profile',
                    value: t('feed.share_link.message', { link: shareUrl }),
                  }),
                );
              }}
            />
          </CardActions>
        </Card>
      )}
    </>
  );
}

function FeedItemRenderer(props: { feedItem: SessionUserEvent }) {
  const friends = useAppSelector((x) => x.feed.friends);
  const ownUserId = useAppSelector(selectOwnFeedUserId);
  const identity = useAppSelector((x) => x.feed.identity.unwrapOr(undefined));
  const { t } = useTranslate();
  const { push } = useRouter();
  const isOwnItem = props.feedItem.userId === ownUserId;
  const records = useEventRecords(props.feedItem.eventId, isOwnItem);
  switch (props.feedItem.type) {
    case 'SessionUserEvent': {
      const authorName = isOwnItem ? identity?.name : friends[props.feedItem.userId]?.name;
      const byline = isOwnItem ? t('feed.you.label') : (authorName ?? t('feed.anonymous_user.label'));
      return (
        <Card testID="feed-view-workout">
          <CardContent>
            <SplitCardControl
              actions={
                <NativeIconButton
                  variant="outlined"
                  icon={OpenInNewIcon}
                  systemImage="arrow.up.right.square"
                  label={t('feed.view_workout.button')}
                  onPress={() => push(getFeedItemHref(props.feedItem.eventId))}
                />
              }
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
                <View style={{ gap: spacing[3] }}>
                  <SessionSummary session={props.feedItem.session} isFilled showWeight showSets />
                  <PrStrip {...records} />
                </View>
              }
            />

            {isOwnItem ? (
              <ReactionSummary key={props.feedItem.eventId} compact eventId={props.feedItem.eventId} animateOnMount />
            ) : (
              <ReactionBar key={props.feedItem.eventId} eventId={props.feedItem.eventId} animateOnMount />
            )}
          </CardContent>
        </Card>
      );
    }
    default:
      return undefined;
  }
}
