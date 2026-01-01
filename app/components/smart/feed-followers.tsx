import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import EmptyInfo from '@/components/presentation/empty-info';
import LimitedHtml from '@/components/presentation/limited-html';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScrollListener';
import { FeedUser, FollowRequest } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import {
  acceptFollowRequest,
  denyFollowRequest,
  fetchInboxItems,
  selectFeedFollowers,
  selectFeedFollowRequests,
  revokeFollowSecretAndRemoveFollower,
} from '@/store/feed';
import { T, useTranslate } from '@tolgee/react';
import React, { useState } from 'react';
import { View } from 'react-native';
import { List } from 'react-native-paper';
import Button from '@/components/presentation/gesture-wrappers/button';
import { useDispatch } from 'react-redux';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import { FlashList } from '@shopify/flash-list';
import { match, P } from 'ts-pattern';

type FeedFollowItem = FollowRequest | FeedUser;

export function FeedFollowers() {
  const followRequests = useAppSelector(
    selectFeedFollowRequests,
  ) as FeedFollowItem[];
  const followers = useAppSelector(selectFeedFollowers);
  const items = followRequests.concat(followers);
  const { handleScroll } = useScroll();
  const fetchingFeedItems = useAppSelector((x) => x.feed.isFetching);
  const dispatch = useDispatch();
  return (
    <FlashList
      style={{ flex: 1 }}
      onRefresh={() => {
        dispatch(fetchInboxItems({ fromUserAction: true }));
      }}
      ListEmptyComponent={
        <EmptyInfo style={{ marginTop: spacing[8] }}>
          <T keyName="feed.nobody_following_you.message" />
        </EmptyInfo>
      }
      refreshing={fetchingFeedItems}
      onScroll={handleScroll}
      data={items}
      keyExtractor={(x) =>
        match(x)
          .with(P.instanceOf(FollowRequest), (req) => `request-${req.userId}`)
          .otherwise((req) => req.id)
      }
      renderItem={({ item }) => <FeedFollowItem item={item} />}
    />
  );
}

function FeedFollowItem(props: { item: FeedFollowItem }) {
  if (props.item instanceof FollowRequest) {
    return <FeedFollowRequest request={props.item} />;
  }

  return <FeedFollowersItem user={props.item} userId={props.item.id} />;
}

function FeedFollowRequest(props: { request: FollowRequest }) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const dispatch = useDispatch();

  const handleAccept = () => {
    dispatch(
      acceptFollowRequest({
        request: props.request,
        fromUserAction: true,
      }),
    );
  };

  const handleDeny = () => {
    dispatch(
      denyFollowRequest({
        request: props.request,
        fromUserAction: true,
      }),
    );
  };

  return (
    <List.Item
      title={props.request.name}
      description={
        <LimitedHtml
          value={t('feed.user_wants_to_follow_you.message', {
            user: props.request.name ?? 'Anonymous user',
          })}
        />
      }
      right={() => {
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton
              icon={'close'}
              iconColor={colors.error}
              onPress={handleDeny}
            />
            <Button
              testID="feed-accept-follow-request"
              mode="contained"
              icon={'check'}
              onPress={handleAccept}
            >
              {t('generic.accept.button')}
            </Button>
          </View>
        );
      }}
    />
  );
}

function FeedFollowersItem(props: { user: FeedUser; userId: string }) {
  const dispatch = useDispatch();
  const unfollow = () => {
    dispatch(
      revokeFollowSecretAndRemoveFollower({
        userId: props.user.id,
        fromUserAction: true,
      }),
    );
  };
  const { t } = useTranslate();

  const [confirmRemoveVisible, setConfirmRemoveVisible] = useState(false);
  return (
    <>
      <ConfirmationDialog
        open={confirmRemoveVisible}
        headline={t('feed.remove_follower.button')}
        textContent={`${t('feed.remove_follower.confirm.body_part1')} ${props.user.name} ${t('feed.remove_follower.confirm.body_part2')}`}
        onOk={unfollow}
        okText={t('generic.remove.button')}
        onCancel={() => {
          setConfirmRemoveVisible(false);
        }}
      />
      <List.Item
        title={
          <LimitedHtml
            emStyles={{}}
            value={t('feed.user_is_following_you.message', {
              user: props.user.name ?? 'Anonymous User',
            })}
          />
        }
        right={() => (
          <IconButton
            testID="following-more-btn"
            icon={'personRemove'}
            onPress={() => {
              setConfirmRemoveVisible(true);
            }}
          />
        )}
      />
    </>
  );
}
