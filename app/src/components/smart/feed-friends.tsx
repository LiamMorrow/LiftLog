import QrCodeIcon from '@expo/material-symbols/qr_code.xml';
import ShareIcon from '@expo/material-symbols/share.xml';
import { useConfirm } from '@/hooks/useConfirm';
import Menu from '@/components/presentation/foundation/menu';
import { PersonRow } from '@/components/presentation/feed/person-row';
import { AppText } from '@/components/presentation/foundation/app-text';
import {
  SegmentedGroup,
  SegmentedListItem,
  SegmentListFormElement,
} from '@/components/presentation/foundation/segmented-list';
import { SegmentedListLink } from '@/components/presentation/foundation/segmented-list-link';
import { NativeIconButton } from '@/components/presentation/foundation/native-icon-button';
import MoreVertIcon from '@expo/material-symbols/more_vert.xml';
import CloseIcon from '@expo/material-symbols/close.xml';
import CheckIcon from '@expo/material-symbols/check.xml';
import PersonAddIcon from '@expo/material-symbols/person_add.xml';
import { useOwnHistory } from '@/components/smart/own-history-provider';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useScroll } from '@/hooks/useScrollListener';
import { useToday } from '@/hooks/useToday';
import { Friend } from '@/models/feed-models';
import { getFeedQrCodeHref } from '@/components/smart/feed-qr-code';
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
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { match } from 'ts-pattern';
import PersonRemove from '@expo/material-symbols/person_remove.xml';
import { LegendList } from '@legendapp/list/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FriendRow =
  | { type: 'header'; key: string; label: string; count: number }
  | { type: 'friend'; key: string; friend: Friend; isFirst: boolean; isLast: boolean };

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
          ...members.map((friend, index): FriendRow => ({
            type: 'friend',
            key: friend.id,
            friend,
            isFirst: index === 0,
            isLast: index === members.length - 1,
          })),
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
      ListHeaderComponent={<ShareProfileRows />}
      refreshing={fetchingFeedItems}
      onScroll={handleScroll}
      data={rows}
      extraData={activityByUser}
      keyExtractor={(x) => x.key}
      renderItem={({ item }) =>
        match(item)
          .with({ type: 'header' }, (row) => <SectionHeader label={row.label} count={row.count} />)
          .with({ type: 'friend' }, (row) => (
            <View style={{ paddingBottom: row.isLast ? 0 : spacing[0.5] }}>
              <SegmentedListItem isFirst={row.isFirst} isLast={row.isLast}>
                <FriendItem friend={row.friend} activity={activityByUser.get(row.friend.id)} />
              </SegmentedListItem>
            </View>
          ))
          .exhaustive()
      }
      contentContainerStyle={{
        paddingHorizontal: spacing.pageHorizontalMargin,
        paddingTop: spacing.pageVerticalMargin,
        paddingBottom: insets.bottom + spacing.pageVerticalMargin,
      }}
    />
  );
}

function SectionHeader(props: { label: string; count: number }) {
  return (
    <AppText
      variant="labelLarge"
      color="onSurfaceVariant"
      style={{ paddingTop: spacing[5], paddingBottom: spacing[2], paddingHorizontal: spacing[1] }}
    >
      {`${props.label} · ${props.count}`}
    </AppText>
  );
}

function ShareProfileRows() {
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const { push } = useRouter();
  const identity = useAppSelector((x) => x.feed.identity.unwrapOr(undefined));

  if (!identity) {
    return null;
  }

  return (
    <SegmentedGroup>
      <SegmentListFormElement
        icon={ShareIcon}
        systemImage="square.and.arrow.up"
        label={t('feed.share_link.row')}
        supportingText={t('feed.share_link.row.supporting')}
        onPress={() => {
          dispatch(
            shareString({
              title: 'Share feed profile',
              value: t('feed.share_link.message', { link: getFeedShareUrl(identity) }),
            }),
          );
        }}
      />
      <SegmentedListLink
        icon={QrCodeIcon}
        systemImage="qrcode"
        label={t('feed.qr_code.row')}
        onPress={() => push(getFeedQrCodeHref())}
      />
    </SegmentedGroup>
  );
}

function FriendItem({ friend, activity }: { friend: Friend; activity: FollowingActivity | undefined }) {
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const confirm = useConfirm();
  const { colors } = useAppTheme();
  const name = friend.name || t('feed.anonymous_user.label');
  const friendId = friend.id;

  const removeLabel = friend.status === 'pending' ? t('feed.cancel_request.button') : t('feed.remove_friend.button');
  const confirmRemove = () =>
    confirm({
      title: removeLabel,
      message: t('feed.remove_friend.confirm.body', { user: name }),
      okText: t('generic.remove.button'),
      destructive: true,
      onOk: () => dispatch(removeFriend({ friendId, notify: true, fromUserAction: true })),
    });
  const removeMenu = (
    <Menu
      trigger={{
        testID: 'friend-more-btn',
        icon: MoreVertIcon,
        systemImage: 'ellipsis',
        label: t('generic.more_options.button'),
      }}
      items={[
        {
          label: removeLabel,
          icon: PersonRemove,
          systemImage: 'person.badge.minus',
          destructive: true,
          onPress: confirmRemove,
        },
      ]}
    />
  );

  const row = match(friend.status)
    .with('incoming', () => (
      <PersonRow
        userId={friendId}
        name={friend.name}
        subtitle={t('feed.wants_to_be_friends.subtitle')}
        trailing={
          <View style={{ flexDirection: 'row' }}>
            <NativeIconButton
              testID="feed-deny-friend-request"
              icon={CloseIcon}
              systemImage="xmark"
              colors={{ content: colors.error }}
              label={t('generic.deny.button')}
              onPress={() => dispatch(denyFriendRequest({ friendId, fromUserAction: true }))}
            />
            <NativeIconButton
              testID="feed-accept-friend-request"
              icon={CheckIcon}
              systemImage="checkmark"
              variant="filled"
              label={t('generic.accept.button')}
              onPress={() => dispatch(acceptFriendRequest({ friendId, fromUserAction: true }))}
            />
          </View>
        }
      />
    ))
    .with('legacyFollowing', () => (
      <PersonRow
        userId={friendId}
        name={friend.name}
        subtitle={t('feed.share_back.subtitle')}
        trailing={
          <View style={{ flexDirection: 'row' }}>
            <NativeIconButton
              testID="feed-decline-share-back"
              icon={CloseIcon}
              systemImage="xmark"
              colors={{ content: colors.error }}
              label={t('generic.remove.button')}
              onPress={confirmRemove}
            />
            <NativeIconButton
              testID="feed-share-back"
              icon={PersonAddIcon}
              systemImage="person.badge.plus"
              variant="filled"
              label={t('feed.share_back.button')}
              onPress={() => dispatch(shareBackWithFriend({ friendId, fromUserAction: true }))}
            />
          </View>
        }
      />
    ))
    .with('friend', () => (
      <PersonRow
        userId={friendId}
        name={friend.name}
        subtitle={<ActivitySummary activity={activity} />}
        trailing={removeMenu}
      />
    ))
    .with('pending', () => (
      <PersonRow
        userId={friendId}
        name={friend.name}
        subtitle={t('feed.waiting_to_accept.subtitle')}
        trailing={removeMenu}
      />
    ))
    .with('legacyFollower', () => (
      <PersonRow
        userId={friendId}
        name={friend.name}
        subtitle={t('feed.waiting_to_share_back.subtitle')}
        trailing={removeMenu}
      />
    ))
    .exhaustive();

  return row;
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
