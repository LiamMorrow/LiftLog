import EmptyInfo from '@/components/presentation/foundation/empty-info';
import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import LimitedHtml from '@/components/presentation/foundation/limited-html';
import { PersonCard } from '@/components/presentation/feed/person-card';
import { WeekActivityStrip } from '@/components/presentation/calendar/week-activity-strip';
import { spacing } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useScroll } from '@/hooks/useScrollListener';
import { useToday } from '@/hooks/useToday';
import { FeedUser } from '@/models/feed-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { FollowingActivity, selectFollowingActivity } from '@/store/activity';
import { fetchInboxItems, selectFeedFollowing, unfollowFeedUser } from '@/store/feed';
import { T, useTranslate } from '@tolgee/react';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Card } from 'react-native-paper';
import Menu from '@/components/presentation/foundation/menu';
import { useDispatch } from 'react-redux';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
import { LegendList } from '@legendapp/list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function FeedFollowing() {
  const following = useAppSelector(selectFeedFollowing);
  const { handleScroll } = useScroll();
  const fetchingFeedItems = useAppSelector((x) => x.feed.isFetching);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  return (
    <LegendList
      style={{ flex: 1 }}
      onRefresh={() => {
        dispatch(fetchInboxItems({ fromUserAction: true }));
      }}
      ListEmptyComponent={
        <Card mode="contained">
          <Card.Content>
            <EmptyInfo icon="personAdd" style={{ paddingVertical: spacing[4] }}>
              <T keyName="feed.not_following_anyone.message" />
            </EmptyInfo>
          </Card.Content>
        </Card>
      }
      refreshing={fetchingFeedItems}
      onScroll={handleScroll}
      data={following}
      keyExtractor={(x) => x.userId}
      renderItem={({ item }) => <FeedFollowingItem user={item.user} userId={item.userId} />}
      ItemSeparatorComponent={() => <View style={{ height: spacing[2] }} />}
      contentContainerStyle={{
        padding: spacing.pageHorizontalMargin,
        paddingBottom: insets.bottom + spacing.pageHorizontalMargin,
      }}
    />
  );
}

function FeedFollowingItem(props: { user: FeedUser; userId: string }) {
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const today = useToday();
  const firstDayOfWeek = useAppSelector((x) => x.settings.firstDayOfWeek);
  const activity = useAppSelectorWithArg(selectFollowingActivity, today).get(props.userId);
  const [confirmUnfollowVisible, setConfirmUnfollowVisible] = useState(false);

  const isAccepted = props.user.type === 'FollowedFeedUser';
  const name = props.user.name || t('feed.anonymous_user.label');

  const unfollow = () => {
    setConfirmUnfollowVisible(false);
    dispatch(unfollowFeedUser({ feedUser: props.user }));
  };

  return (
    <>
      <ConfirmationDialog
        open={confirmUnfollowVisible}
        headline={t('feed.unfollow_user.button')}
        textContent={<LimitedHtml value={t('feed.unfollow_user.confirm.body', { user: name })} />}
        onOk={unfollow}
        okText={t('feed.unfollow.button')}
        onCancel={() => {
          setConfirmUnfollowVisible(false);
        }}
      />
      <PersonCard
        userId={props.userId}
        name={props.user.name}
        subtitle={isAccepted ? <ActivitySummary activity={activity} /> : t('generic.awaiting_response.label')}
        trailing={
          <Menu
            trigger={(open) => <IconButton testID="following-more-btn" onPress={open} icon={'moreHoriz'} />}
            items={[
              {
                label: t('feed.unfollow.button'),
                icon: 'personRemove',
                systemImage: 'person.badge.minus',
                destructive: true,
                onPress: () => {
                  setConfirmUnfollowVisible(true);
                },
              },
            ]}
          />
        }
      >
        {isAccepted && activity ? <WeekActivityStrip cells={activity.cells} firstDayOfWeek={firstDayOfWeek} /> : null}
      </PersonCard>
    </>
  );
}

function ActivitySummary({ activity }: { activity: FollowingActivity | undefined }) {
  const { t } = useTranslate();
  const formatDate = useFormatDate();

  if (activity?.workoutsThisWeek) {
    return activity.workoutsThisWeek === 1
      ? t('feed.workouts_this_week.one')
      : t('feed.workouts_this_week.other', { count: activity.workoutsThisWeek.toString() });
  }

  if (activity?.lastWorkoutDate) {
    return t('feed.last_workout.label', {
      day: formatDate(activity.lastWorkoutDate, { day: 'numeric', month: 'short' }),
    });
  }

  return t('feed.no_recent_workouts.label');
}
