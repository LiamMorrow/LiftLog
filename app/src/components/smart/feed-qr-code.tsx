import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { renderFeedQrCode } from '@/components/presentation/feed/feed-qr-code';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import { Remote } from '@/components/presentation/foundation/remote';
import { CreateFeedAccountCard } from '@/components/smart/create-feed-account-card';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { shareString } from '@/store/app';
import { getFeedShareUrl, selectFeedIdentityRemote } from '@/store/feed';
import ShareIcon from '@expo/material-symbols/share.xml';
import { useTranslate } from '@tolgee/react';
import { Href, Stack } from 'expo-router';
import { Image, useWindowDimensions, View } from 'react-native';
import { useDispatch } from 'react-redux';

const MAX_DISPLAY_WIDTH = 420;

export function getFeedQrCodeHref(opts?: { fromSettings?: boolean }): Href {
  return opts?.fromSettings ? '/settings/feed-qr' : '/feed/qr';
}

export function FeedQrCode() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const identityRemote = useAppSelector(selectFeedIdentityRemote);
  const identity = identityRemote.unwrapOr(undefined);
  const link = identity && getFeedShareUrl(identity);
  const image =
    identity &&
    link &&
    renderFeedQrCode({
      link,
      name: identity.name,
      caption: t('feed.qr.caption'),
      themeColor: colors.primary,
    });
  const displayWidth = Math.min(width - spacing.pageHorizontalMargin * 2, MAX_DISPLAY_WIDTH);
  const createAccount = () => <CreateFeedAccountCard />;

  return (
    <FullHeightScrollView
      floatingChildren={
        image && link ? (
          <PageActions
            primary={{
              label: t('generic.share.button'),
              icon: ShareIcon,
              systemImage: 'square.and.arrow.up',
              onPress: () =>
                dispatch(
                  shareString({ title: t('feed.profile.title'), value: t('feed.share_link.message', { link }) }),
                ),
            }}
          />
        ) : undefined
      }
    >
      <Stack.Screen options={{ title: t('feed.qr.title') }} />
      <View style={{ alignItems: 'center', padding: spacing.pageHorizontalMargin }}>
        <Remote
          value={identityRemote}
          notAsked={createAccount}
          loading={createAccount}
          error={createAccount}
          success={() =>
            image ? (
              <Image
                testID="feed-qr-code"
                source={{ uri: `data:image/png;base64,${image.encodeToBase64()}` }}
                style={{
                  width: displayWidth,
                  height: (displayWidth * image.height()) / image.width(),
                  borderRadius: spacing[6],
                }}
              />
            ) : undefined
          }
        />
      </View>
    </FullHeightScrollView>
  );
}
