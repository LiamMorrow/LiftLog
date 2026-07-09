import EmptyInfo from '@/components/presentation/foundation/empty-info';
import { spacing } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScrollListener';
import { FeedUser } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { fetchInboxItems, selectFeedFollowing, unfollowFeedUser } from '@/store/feed';
import { T, useTranslate } from '@tolgee/react';
import React from 'react';
import { List } from 'react-native-paper';
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
        <EmptyInfo style={{ marginTop: spacing[8] }}>
          <T keyName="feed.not_following_anyone.message" />
        </EmptyInfo>
      }
      refreshing={fetchingFeedItems}
      onScroll={handleScroll}
      data={following}
      keyExtractor={(x) => x.userId}
      renderItem={({ item }) => <FeedFollowingItem user={item.user} userId={item.userId} />}
      contentContainerStyle={{
        paddingBottom: insets.bottom,
      }}
    />
  );
}

function FeedFollowingItem(props: { user: FeedUser; userId: string }) {
  const dispatch = useDispatch();
  const unfollow = () => {
    dispatch(unfollowFeedUser({ feedUser: props.user }));
  };
  const { t } = useTranslate();
  return (
    <List.Item
      title={props.user.name || 'Anonymous user'}
      description={props.user.type === 'FollowedFeedUser' ? undefined : t('generic.awaiting_response.label')}
      right={() => (
        <Menu
          trigger={(open) => <IconButton testID="following-more-btn" onPress={open} icon={'moreHoriz'} />}
          items={[
            {
              label: t('feed.unfollow.button'),
              icon: 'personRemove',
              systemImage: 'person.badge.minus',
              onPress: unfollow,
            },
          ]}
        />
      )}
    />
  );
}
