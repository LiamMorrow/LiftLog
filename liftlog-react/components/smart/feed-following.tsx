import { useScroll } from '@/hooks/useScollListener';
import { FeedUser } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { fetchInboxItems, selectFeedFollowing } from '@/store/feed';
import { useTranslate } from '@tolgee/react';
import React, { useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { IconButton, List, Menu } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export function FeedFollowing() {
  const following = useAppSelector(selectFeedFollowing);
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
      data={following}
      keyExtractor={(x) => x.userId}
      renderItem={({ item }) => (
        <FeedFollowingItem user={item.user} userId={item.userId} />
      )}
    />
  );
}

function FeedFollowingItem(props: { user: FeedUser; userId: string }) {
  const viewPlan = () => {}; // TODO
  const unfollow = () => {}; // TODO
  const { t } = useTranslate();
  const [menuVisible, setMenuVisible] = useState(false);
  return (
    <List.Item
      title={props.user.name}
      description={
        // TODO this aint right - it should just be unset. Bad deserialization/serialization maybe
        props.user.aesKey?.value.length ? undefined : t('AwaitingResponse')
      }
      right={() => (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              data-cy="following-more-btn"
              onPress={() => setMenuVisible(true)}
              icon={'moreHoriz'}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              viewPlan();
              setMenuVisible(false);
            }}
            disabled={!props.user.currentPlan.length}
            leadingIcon={'assignment'}
            title={t('ViewTheirPlan')}
          />
          <Menu.Item
            onPress={() => {
              unfollow();
              setMenuVisible(false);
            }}
            leadingIcon={'personRemove'}
            title={t('Unfollow')}
          />
        </Menu>
      )}
    />
  );
}
