import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import LimitedHtml from '@/components/presentation/foundation/limited-html';
import CardActions from '@/components/presentation/foundation/card-actions';
import Menu from '@/components/presentation/foundation/menu';
import { PersonCard } from '@/components/presentation/feed/person-card';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScrollListener';
import { FeedUser, FollowRequestInboxMessage } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { shareString } from '@/store/app';
import {
  acceptFollowRequest,
  denyFollowRequest,
  fetchInboxItems,
  getFeedShareUrl,
  requestFollowUser,
  selectFeedFollowers,
  selectFeedFollowRequests,
  revokeFollowSecretAndRemoveFollower,
} from '@/store/feed';
import { T, useTranslate } from '@tolgee/react';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Card } from 'react-native-paper';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
import { useDispatch } from 'react-redux';
import { match } from 'ts-pattern';
import { LegendList } from '@legendapp/list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FollowerRow =
  | { type: 'header'; key: string; label: string; count: number }
  | { type: 'request'; key: string; request: FollowRequestInboxMessage }
  | { type: 'follower'; key: string; user: FeedUser };

export function FeedFollowers() {
  const { t } = useTranslate();
  const followRequests = useAppSelector(selectFeedFollowRequests);
  const followers = useAppSelector(selectFeedFollowers);
  const { handleScroll } = useScroll();
  const fetchingFeedItems = useAppSelector((x) => x.feed.isFetching);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const rows: FollowerRow[] = [
    ...(followRequests.length
      ? ([
          { type: 'header', key: 'requests-header', label: t('feed.requests.title'), count: followRequests.length },
          ...followRequests.map(
            (request): FollowerRow => ({ type: 'request', key: `request-${request.senderUserId}`, request }),
          ),
        ] satisfies FollowerRow[])
      : []),
    ...(followers.length
      ? ([
          { type: 'header', key: 'followers-header', label: t('feed.followers.title'), count: followers.length },
          ...followers.map((user): FollowerRow => ({ type: 'follower', key: user.id, user })),
        ] satisfies FollowerRow[])
      : []),
  ];

  return (
    <LegendList
      style={{ flex: 1 }}
      onRefresh={() => {
        dispatch(fetchInboxItems({ fromUserAction: true }));
      }}
      ListEmptyComponent={<FollowersEmpty />}
      refreshing={fetchingFeedItems}
      onScroll={handleScroll}
      data={rows}
      keyExtractor={(x) => x.key}
      renderItem={({ item }) =>
        match(item)
          .with({ type: 'header' }, (row) => <SectionHeader label={row.label} count={row.count} />)
          .with({ type: 'request' }, (row) => <FeedFollowRequest request={row.request} />)
          .with({ type: 'follower' }, (row) => <FeedFollowersItem user={row.user} />)
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

function FollowersEmpty() {
  const dispatch = useDispatch();
  const identity = useAppSelector((x) => x.feed.identity.unwrapOr(undefined));

  return (
    <Card mode="contained">
      <Card.Content>
        <EmptyInfo icon="personAdd" style={{ paddingVertical: spacing[4] }}>
          <T keyName="feed.share_link_to_get_followers.body" />
        </EmptyInfo>
      </Card.Content>
      {identity ? (
        <CardActions>
          <Button
            testID="followers-share-button"
            mode="contained"
            icon={'share'}
            onPress={() => {
              dispatch(
                shareString({
                  title: 'Share feed profile',
                  value: getFeedShareUrl(identity),
                }),
              );
            }}
          >
            <T keyName="generic.share.button" />
          </Button>
        </CardActions>
      ) : null}
    </Card>
  );
}

function FeedFollowRequest(props: { request: FollowRequestInboxMessage }) {
  const { t } = useTranslate();
  const dispatch = useDispatch();

  return (
    <PersonCard
      userId={props.request.senderUserId}
      name={props.request.payload.name}
      subtitle={t('feed.wants_to_follow_you.subtitle')}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing[2] }}>
        <Button
          testID="feed-deny-follow-request"
          mode="outlined"
          icon={'close'}
          onPress={() => {
            dispatch(denyFollowRequest({ request: props.request, fromUserAction: true }));
          }}
        >
          {t('generic.deny.button')}
        </Button>
        <Button
          testID="feed-accept-follow-request"
          mode="contained"
          icon={'check'}
          onPress={() => {
            dispatch(acceptFollowRequest({ request: props.request, fromUserAction: true }));
          }}
        >
          {t('generic.accept.button')}
        </Button>
      </View>
    </PersonCard>
  );
}

function FeedFollowersItem(props: { user: FeedUser }) {
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const [confirmRemoveVisible, setConfirmRemoveVisible] = useState(false);

  const followBackState = useAppSelector((x) => x.feed.followedUsers[props.user.id]);
  const isFollowingBack = followBackState !== undefined;
  const followBackAccepted = followBackState?.type === 'FollowedFeedUser';
  const name = props.user.name || t('feed.anonymous_user.label');

  const removeFollower = () => {
    setConfirmRemoveVisible(false);
    dispatch(revokeFollowSecretAndRemoveFollower({ userId: props.user.id, fromUserAction: true }));
  };

  const subtitle = match({ isFollowingBack, followBackAccepted })
    .with({ followBackAccepted: true }, () => t('feed.following_back.label'))
    .with({ isFollowingBack: true }, () => t('generic.awaiting_response.label'))
    .otherwise(() => undefined);

  return (
    <>
      <ConfirmationDialog
        open={confirmRemoveVisible}
        headline={t('feed.remove_follower.button')}
        textContent={<LimitedHtml value={t('feed.remove_follower.confirm.body', { user: name })} />}
        onOk={removeFollower}
        okText={t('generic.remove.button')}
        onCancel={() => {
          setConfirmRemoveVisible(false);
        }}
      />
      <PersonCard
        userId={props.user.id}
        name={props.user.name}
        subtitle={subtitle}
        trailing={
          <Menu
            trigger={(open) => <IconButton testID="follower-more-btn" onPress={open} icon={'moreHoriz'} />}
            items={[
              {
                label: t('feed.remove_follower.button'),
                icon: 'personRemove',
                systemImage: 'person.badge.minus',
                destructive: true,
                onPress: () => {
                  setConfirmRemoveVisible(true);
                },
              },
            ]}
          />
        }
      >
        {!isFollowingBack ? (
          <Button
            testID="feed-follow-back"
            mode="contained-tonal"
            icon={'personAdd'}
            onPress={() => {
              dispatch(requestFollowUser({ user: props.user, fromUserAction: true }));
            }}
          >
            {t('feed.follow_back.short.button')}
          </Button>
        ) : null}
      </PersonCard>
    </>
  );
}
