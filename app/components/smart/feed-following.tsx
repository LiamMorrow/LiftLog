import EmptyInfo from '@/components/presentation/empty-info';
import { spacing } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScrollListener';
import { FeedUser } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import {
  fetchInboxItems,
  selectFeedFollowing,
  unfollowFeedUser,
} from '@/store/feed';
import { T, useTranslate } from '@tolgee/react';
import React, { useState } from 'react';
import { List, Menu } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import { FlashList } from '@shopify/flash-list';

export function FeedFollowing() {
  const following = useAppSelector(selectFeedFollowing);
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
          <T keyName="feed.not_following_anyone.message" />
        </EmptyInfo>
      }
      refreshing={fetchingFeedItems}
      onScroll={handleScroll}
      data={following}
      keyExtractor={(x) => x.userId}
      renderItem={({ item }) => (
        <FeedFollowingItem user={item.user} userId={item.userId} />
      )}
    />
  );
}

function FeedFollowingItem(props: { user: FeedUser; userId: string }) {
  const dispatch = useDispatch();
  const unfollow = () => {
    dispatch(unfollowFeedUser({ feedUser: props.user }));
  };
  const { t } = useTranslate();
  const [menuVisible, setMenuVisible] = useState(false);
  return (
    <List.Item
      title={props.user.name || 'Anonymous user'}
      description={
        props.user.aesKey ? undefined : t('generic.awaiting_response.label')
      }
      right={() => (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              testID="following-more-btn"
              onPress={() => setMenuVisible(true)}
              icon={'moreHoriz'}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              unfollow();
              setMenuVisible(false);
            }}
            leadingIcon={'personRemove'}
            title={t('feed.unfollow.button')}
          />
        </Menu>
      )}
    />
  );
}
