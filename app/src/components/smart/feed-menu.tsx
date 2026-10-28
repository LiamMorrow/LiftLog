import PageMenu from '@/components/presentation/foundation/page-menu';
import { MenuItem } from '@/components/presentation/foundation/menu';
import { useAppSelector } from '@/store';
import { selectFeedIdentityRemote } from '@/store/feed';
import { getFeedQrCodeHref } from '@/components/smart/feed-qr-code';
import { getFeedSettingsHref } from '@/components/smart/feed-settings';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import Settings from '@expo/material-symbols/settings.xml';
import Share from '@expo/material-symbols/share.xml';

export function FeedMenu() {
  const { t } = useTranslate();
  const { push } = useRouter();
  const identity = useAppSelector(selectFeedIdentityRemote).unwrapOr(undefined);
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
