import PageMenu from '@/components/presentation/foundation/page-menu';
import { MenuItem } from '@/components/presentation/foundation/menu';
import { useAppSelector } from '@/store';
import { useAppTheme } from '@/hooks/useAppTheme';
import { selectFeedIdentityRemote, selectIncomingFriendRequestCount } from '@/store/feed';
import { getFeedQrCodeHref } from '@/components/smart/feed-qr-code';
import { getFeedSettingsHref } from '@/components/smart/feed-settings';
import { useOwnHistory } from '@/components/smart/own-history-provider';
import { useStreakToolbarItem } from '@/components/smart/streak-toolbar-item';
import { useTranslate } from '@tolgee/react';
import { Href, Stack, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import Group from '@expo/material-symbols/group.xml';
import Settings from '@expo/material-symbols/settings.xml';
import Share from '@expo/material-symbols/share.xml';

export function getFeedFriendsHref(): Href {
  return '/feed/friends';
}

export function FeedMenu() {
  const { t } = useTranslate();
  const { push } = useRouter();
  const { colors } = useAppTheme();
  const identity = useAppSelector(selectFeedIdentityRemote).unwrapOr(undefined);
  const streakToolbarItem = useStreakToolbarItem(useOwnHistory().streak);
  const requestCount = useAppSelector(selectIncomingFriendRequestCount);
  const friendsButton = (
    <Stack.Toolbar.Button
      key="friends"
      hidden={!identity}
      accessibilityLabel={t('feed.friends.title')}
      onPress={() => push(getFeedFriendsHref())}
    >
      <Stack.Toolbar.Icon sf="person.2" {...(Platform.OS === 'ios' ? {} : { src: Group })} />
      {requestCount ? (
        <Stack.Toolbar.Badge style={{ backgroundColor: colors.error, color: colors.onError }}>
          {requestCount.toString()}
        </Stack.Toolbar.Badge>
      ) : undefined}
    </Stack.Toolbar.Button>
  );
  const shareItems: MenuItem[] = identity
    ? [
        {
          label: t('feed.share_feed.button'),
          icon: Share,
          systemImage: 'square.and.arrow.up',
          onPress: () => push(getFeedQrCodeHref()),
        },
      ]
    : [];

  return (
    <PageMenu
      testID="feed-menu"
      actions={[streakToolbarItem, friendsButton]}
      items={[
        {
          label: t('feed.settings.title'),
          icon: Settings,
          systemImage: 'gearshape',
          onPress: () => push(getFeedSettingsHref()),
        },
        ...shareItems,
      ]}
    />
  );
}
