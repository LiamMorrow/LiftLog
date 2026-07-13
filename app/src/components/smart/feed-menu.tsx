import PageMenu from '@/components/presentation/foundation/page-menu';
import { useAppSelector } from '@/store';
import { shareString } from '@/store/app';
import { getFeedShareUrl, selectFeedIdentityRemote } from '@/store/feed';
import { getFeedProfileEditorHref } from '@/components/smart/feed-profile-editor';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';

export function FeedMenu() {
  const { t } = useTranslate();
  const { push } = useRouter();
  const dispatch = useDispatch();
  const identity = useAppSelector(selectFeedIdentityRemote).unwrapOr(undefined);

  if (!identity) {
    return null;
  }

  return (
    <PageMenu
      testID="feed-menu"
      items={[
        {
          label: t('feed.edit_profile.button'),
          icon: 'edit',
          systemImage: 'pencil',
          onPress: () => push(getFeedProfileEditorHref()),
        },
        {
          label: t('feed.share_feed.button'),
          icon: 'share',
          systemImage: 'square.and.arrow.up',
          onPress: () =>
            dispatch(
              shareString({
                title: t('feed.profile.title'),
                value: getFeedShareUrl(identity),
              }),
            ),
        },
      ]}
    />
  );
}
