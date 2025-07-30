import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import EmptyInfo from '@/components/presentation/empty-info';
import LimitedHtml from '@/components/presentation/limited-html';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScollListener';
import { FeedUser, FollowRequest } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import {
  acceptFollowRequest,
  denyFollowRequest,
  fetchInboxItems,
  selectFeedFollowers,
  selectFeedFollowRequests,
  startRemoveFollower,
} from '@/store/feed';
import { T, useTranslate } from '@tolgee/react';
import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { IconButton, Button, List } from 'react-native-paper';
import { useDispatch } from 'react-redux';

type FeedFollowItem = FollowRequest | { userId: string; user: FeedUser };

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
    <FlatList
      onRefresh={() => {
        dispatch(fetchInboxItems({ fromUserAction: true }));
      }}
      ListEmptyComponent={
        <EmptyInfo style={{ marginTop: spacing[8] }}>
          <T keyName="NobodyFollowingYou" />
        </EmptyInfo>
      }
      refreshing={fetchingFeedItems}
      onScroll={handleScroll}
      data={items}
      keyExtractor={(x) => x.userId}
      renderItem={({ item }) => <FeedFollowItem item={item} />}
    />
  );
}

function FeedFollowItem(props: { item: FeedFollowItem }) {
  if (props.item instanceof FollowRequest) {
    return <FeedFollowRequest request={props.item} />;
  }

  return (
    <FeedFollowersItem user={props.item.user} userId={props.item.userId} />
  );
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
          value={t('UserWantsToFollowYou{User}', {
            0: props.request.name ?? 'Anonymous user',
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
            <Button mode="contained" icon={'check'} onPress={handleAccept}>
              {t('Accept')}
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
    dispatch(startRemoveFollower({ user: props.user, fromUserAction: true }));
  };
  const { t } = useTranslate();

  const [confirmRemoveVisible, setConfirmRemoveVisible] = useState(false);
  return (
    <>
      <ConfirmationDialog
        open={confirmRemoveVisible}
        headline={t('RemoveFollower')}
        textContent={`${t('RemoveFollowerMsgPart1')} ${props.user.name} ${t('RemoveFollowerMsgPart2')}`}
        onOk={unfollow}
        okText={t('Remove')}
        onCancel={() => {
          setConfirmRemoveVisible(false);
        }}
      />
      <List.Item
        title={
          <LimitedHtml
            emStyles={{}}
            value={t('UserIsFollowingYou{User}', {
              0: props.user.name ?? 'Anonymous User',
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
