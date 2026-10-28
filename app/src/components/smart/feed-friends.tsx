import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import LimitedHtml from '@/components/presentation/foundation/limited-html';
import CardActions from '@/components/presentation/foundation/card-actions';
import Menu from '@/components/presentation/foundation/menu';
import { PersonCard } from '@/components/presentation/feed/person-card';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { WeekActivityStrip } from '@/components/presentation/calendar/week-activity-strip';
import Button from '@/components/presentation/foundation/button';
import IconButton from '@/components/presentation/foundation/icon-button';
import { useOwnHistory } from '@/components/smart/own-history-provider';
import { spacing } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useScroll } from '@/hooks/useScrollListener';
import { useToday } from '@/hooks/useToday';
import { Friend } from '@/models/feed-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { FollowingActivity, selectFollowingActivity } from '@/store/activity';
import { shareString } from '@/store/app';
import {
  acceptFriendRequest,
  denyFriendRequest,
  fetchInboxItems,
  getFeedShareUrl,
  removeFriend,
  selectFriendList,
  shareBackWithFriend,
} from '@/store/feed';
import { T, useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { Card } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { match } from 'ts-pattern';
import PersonRemove from '@expo/material-symbols/person_remove.xml';
import { LegendList } from '@legendapp/list/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FriendRow =
  | { type: 'header'; key: string; label: string; count: number }
  | { type: 'friend'; key: string; friend: Friend };

export function FeedFriends() {
  const { t } = useTranslate();
  const friends = useAppSelector(selectFriendList);
  const { handleScroll } = useScroll();
  const fetchingFeedItems = useAppSelector((x) => x.feed.isFetching);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const today = useToday();
  const own = useOwnHistory();
  const activityByUser = useAppSelectorWithArg(selectFollowingActivity, { today, own });

  const section = (key: string, label: string, members: Friend[]): FriendRow[] =>
    members.length
      ? [
          { type: 'header', key: `${key}-header`, label, count: members.length },
          ...members.map((friend): FriendRow => ({ type: 'friend', key: friend.id, friend })),
        ]
      : [];
  const withStatus = (...statuses: Friend['status'][]) => friends.filter((x) => statuses.includes(x.status));

  const rows = [
    ...section('requests', t('feed.requests.title'), withStatus('incoming', 'legacyFollowing')),
    ...section('friends', t('feed.friends.title'), withStatus('friend')),
    ...section('waiting', t('feed.waiting.title'), withStatus('pending', 'legacyFollower')),
  ];

  return (
    <LegendList
      style={{ flex: 1 }}
      onRefresh={() => {
        dispatch(fetchInboxItems({ fromUserAction: true }));
      }}
      ListHeaderComponent={<ShareProfileCard />}
      refreshing={fetchingFeedItems}
      onScroll={handleScroll}
      data={rows}
      extraData={activityByUser}
      keyExtractor={(x) => x.key}
      renderItem={({ item }) =>
        match(item)
          .with({ type: 'header' }, (row) => <SectionHeader label={row.label} count={row.count} />)
          .with({ type: 'friend' }, (row) => (
            <FriendItem friend={row.friend} activity={activityByUser.get(row.friend.id)} />
          ))
          .exhaustive()
      }
      ItemSeparatorComponent={() => <View style={{ height: spacing[2] }} />}
      contentContainerStyle={{
        padding: spacing.pageHorizontalMargin,
        paddingBottom: insets.bottom + spacing.pageHorizontalMargin,
      }}
    />
  );
}

function SectionHeader(props: { label: string; count: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingTop: spacing[1] }}>
      <SurfaceText font="text-sm" weight="bold" color="onSurfaceVariant" style={{ letterSpacing: 0.6 }}>
        {props.label.toUpperCase()}
      </SurfaceText>
      <SurfaceText font="text-sm" color="onSurfaceVariant">
        {props.count.toString()}
      </SurfaceText>
    </View>
  );
}

function ShareProfileCard() {
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const identity = useAppSelector((x) => x.feed.identity.unwrapOr(undefined));

  if (!identity) {
    return null;
  }

  return (
    <Card mode="contained" style={{ marginBottom: spacing[2] }}>
      <Card.Content>
        <SurfaceText>
          <T keyName="feed.share_link.body" />
        </SurfaceText>
      </Card.Content>
      <CardActions>
        <Button
          testID="friends-share-button"
          mode="contained"
          icon={'share'}
          onPress={() => {
            dispatch(
              shareString({
                title: 'Share feed profile',
                value: t('feed.share_link.message', { link: getFeedShareUrl(identity) }),
              }),
            );
          }}
        >
          <T keyName="generic.share.button" />
        </Button>
      </CardActions>
    </Card>
  );
}

function FriendItem({ friend, activity }: { friend: Friend; activity: FollowingActivity | undefined }) {
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const [confirmRemoveVisible, setConfirmRemoveVisible] = useState(false);
  const name = friend.name || t('feed.anonymous_user.label');
  const friendId = friend.id;

  const remove = () => {
    setConfirmRemoveVisible(false);
    dispatch(removeFriend({ friendId, notify: true, fromUserAction: true }));
  };

  const removeLabel = friend.status === 'pending' ? t('feed.cancel_request.button') : t('feed.remove_friend.button');
  const removeMenu = (
    <Menu
      trigger={(open) => <IconButton testID="friend-more-btn" onPress={open} icon={'moreHoriz'} />}
      items={[
        {
          label: removeLabel,
          icon: PersonRemove,
          systemImage: 'person.badge.minus',
          destructive: true,
          onPress: () => setConfirmRemoveVisible(true),
        },
      ]}
    />
  );

  const card = match(friend.status)
    .with('incoming', () => (
      <PersonCard userId={friendId} name={friend.name} subtitle={t('feed.wants_to_be_friends.subtitle')}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing[2] }}>
          <Button
            testID="feed-deny-friend-request"
            mode="outlined"
            icon={'close'}
            onPress={() => dispatch(denyFriendRequest({ friendId, fromUserAction: true }))}
          >
            {t('generic.deny.button')}
          </Button>
          <Button
            testID="feed-accept-friend-request"
            mode="contained"
            icon={'check'}
            onPress={() => dispatch(acceptFriendRequest({ friendId, fromUserAction: true }))}
          >
            {t('generic.accept.button')}
          </Button>
        </View>
      </PersonCard>
    ))
    .with('legacyFollowing', () => (
      <PersonCard userId={friendId} name={friend.name} subtitle={t('feed.share_back.subtitle')}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing[2] }}>
          <Button testID="feed-decline-share-back" mode="outlined" onPress={() => setConfirmRemoveVisible(true)}>
            {t('generic.remove.button')}
          </Button>
          <Button
            testID="feed-share-back"
            mode="contained"
            icon={'personAdd'}
            onPress={() => dispatch(shareBackWithFriend({ friendId, fromUserAction: true }))}
          >
            {t('feed.share_back.button')}
          </Button>
        </View>
      </PersonCard>
    ))
    .with('friend', () => (
      <PersonCard
        userId={friendId}
        name={friend.name}
        subtitle={<ActivitySummary activity={activity} />}
        trailing={removeMenu}
      >
        {activity ? <WeekActivityStrip cells={activity.cells} /> : null}
      </PersonCard>
    ))
    .with('pending', () => (
      <PersonCard
        userId={friendId}
        name={friend.name}
        subtitle={t('feed.waiting_to_accept.subtitle')}
        trailing={removeMenu}
      />
    ))
    .with('legacyFollower', () => (
      <PersonCard
        userId={friendId}
        name={friend.name}
        subtitle={t('feed.waiting_to_share_back.subtitle')}
        trailing={removeMenu}
      />
    ))
    .exhaustive();

  return (
    <>
      <ConfirmationDialog
        open={confirmRemoveVisible}
        headline={removeLabel}
        textContent={<LimitedHtml value={t('feed.remove_friend.confirm.body', { user: name })} />}
        onOk={remove}
        okText={t('generic.remove.button')}
        onCancel={() => setConfirmRemoveVisible(false)}
      />
      {card}
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
