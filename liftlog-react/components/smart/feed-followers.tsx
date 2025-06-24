import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import LimitedHtml from '@/components/presentation/limited-html';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScollListener';
import { FeedUser, FollowRequest } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import {
  fetchInboxItems,
  selectFeedFollowers,
  selectFeedFollowRequests,
} from '@/store/feed';
import { useTranslate } from '@tolgee/react';
import React, { useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from 'react-native';
import { IconButton, Button, List } from 'react-native-paper';
import { useDispatch } from 'react-redux';

type FeedFollowItem = FollowRequest | { userId: string; user: FeedUser };

export function FeedFollowers() {
  const followRequests = useAppSelector(
    selectFeedFollowRequests,
  ) as FeedFollowItem[];
  const followers = useAppSelector(selectFeedFollowers);
  const items = followRequests.concat(followers);
  const { setScrolled } = useScroll();
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrolled(offsetY > 0);
  };
  const fetchingFeedItems = useAppSelector((x) => x.feed.isFetching);
  const dispatch = useDispatch();
  return (
    <FlatList
      onRefresh={() => {
        dispatch(fetchInboxItems({ fromUserAction: true }));
      }}
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
            <IconButton icon={'close'} iconColor={colors.error} />
            <Button mode="contained" icon={'check'}>
              {t('Accept')}
            </Button>
          </View>
        );
      }}
    />
  );
}

function FeedFollowersItem(props: { user: FeedUser; userId: string }) {
  const unfollow = () => {}; // TODO
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
            value={t('UserIsFollowingYou{User}', {
              0: props.user.name ?? 'Anonymous User',
            })}
          />
        }
        right={() => (
          <IconButton
            data-cy="following-more-btn"
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
