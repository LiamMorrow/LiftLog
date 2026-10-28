import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import LimitedHtml from '@/components/presentation/foundation/limited-html';
import { Remote } from '@/components/presentation/foundation/remote';
import { useCreateFeedAccount } from '@/components/smart/create-feed-account-card';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { SharedFeedUser } from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { useAppSelector } from '@/store';
import {
  fetchAndSetSharedFeedUser,
  requestFriend,
  selectFeedIdentityRemote,
  selectOwnFeedUserId,
  selectSharedFeedUser,
  setSharedFeedUser,
} from '@/store/feed';
import { useTranslate } from '@tolgee/react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import { PersonAvatar } from '@/components/presentation/feed/person-avatar';
import PersonAddIcon from '@expo/material-symbols/person_add.xml';
import CheckIcon from '@expo/material-symbols/check.xml';
import { useDispatch } from 'react-redux';
import { match } from 'ts-pattern';

export default function FeedSharePage() {
  const { t } = useTranslate();
  const { id, name } = useLocalSearchParams<{
    id?: string;
    name?: string;
  }>();
  const dispatch = useDispatch();

  const fetchUser = useCallback(() => {
    if (!id) {
      dispatch(setSharedFeedUser(RemoteData.error('Failed to load user')));
      return;
    }
    dispatch(
      fetchAndSetSharedFeedUser({
        idOrLookup: id,
        name: name ?? '',
        fromUserAction: true,
      }),
    );
  }, [dispatch, id, name]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const sharedProfileRemote = useAppSelector(selectSharedFeedUser);
  const user = sharedProfileRemote.unwrapOr(undefined);

  return (
    <FullHeightScrollView floatingChildren={user && <AddFriendActions user={user} />}>
      <Stack.Screen options={{ title: t('feed.add_friend.title') }} />
      <Remote retry={fetchUser} value={sharedProfileRemote} success={(user) => <AddFriendContent user={user} />} />
    </FullHeightScrollView>
  );
}

function useFriendInvite(user: SharedFeedUser) {
  const { t } = useTranslate();
  const ownUserId = useAppSelector(selectOwnFeedUserId);
  const hasAccount = useAppSelector(selectFeedIdentityRemote).isSuccess();
  const existing = useAppSelector((x) => x.feed.friends[user.id]);
  const displayName = user.name || t('feed.anonymous_user.label');

  const invite = match({ isOwn: user.id === ownUserId, status: existing?.status })
    .with({ isOwn: true }, () => ({ message: t('feed.own_link.body'), explanation: undefined, action: undefined }))
    .with({ status: 'friend' }, () => ({
      message: t('feed.already_friends.body', { user: displayName }),
      explanation: undefined,
      action: undefined,
    }))
    .with({ status: 'pending' }, () => ({
      message: t('feed.request_already_sent.body', { user: displayName }),
      explanation: undefined,
      action: undefined,
    }))
    .with({ status: 'legacyFollower' }, () => ({
      message: t('feed.waiting_for_share_back.body', { user: displayName }),
      explanation: undefined,
      action: undefined,
    }))
    .with({ status: 'incoming' }, () => ({
      message: t('feed.wants_to_be_friends.body', { user: displayName }),
      explanation: t('feed.add_friend.explanation', { user: displayName }),
      action: t('generic.accept.button'),
    }))
    .with({ status: 'legacyFollowing' }, () => ({
      message: t('feed.share_back.body', { user: displayName }),
      explanation: t('feed.add_friend.explanation', { user: displayName }),
      action: t('feed.share_back.button'),
    }))
    .with({ status: undefined }, () => ({
      message: t('feed.add_friend.body', { user: displayName }),
      explanation: t('feed.add_friend.explanation', { user: displayName }),
      action: t('feed.send_request.button'),
    }))
    .exhaustive();
  return { ...invite, needsAccount: !!invite.action && !hasAccount };
}

function AddFriendContent({ user }: { user: SharedFeedUser }) {
  const { t } = useTranslate();
  const { message, explanation, needsAccount } = useFriendInvite(user);

  return (
    <View
      style={{
        alignItems: 'center',
        gap: spacing[4],
        paddingHorizontal: spacing.pageHorizontalMargin,
        paddingTop: spacing[8],
      }}
    >
      <PersonAvatar userId={user.id} name={user.name} size={88} />
      <SurfaceText font="text-xl" style={{ textAlign: 'center' }}>
        <LimitedHtml value={message} />
      </SurfaceText>
      {explanation ? (
        <SurfaceText style={{ textAlign: 'center' }} color="onSurfaceVariant">
          <LimitedHtml value={explanation} />
        </SurfaceText>
      ) : null}
      {needsAccount ? (
        <SurfaceText style={{ textAlign: 'center' }} color="onSurfaceVariant">
          {t('feed.create_account.body')}
        </SurfaceText>
      ) : null}
    </View>
  );
}

function AddFriendActions({ user }: { user: SharedFeedUser }) {
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const { back } = useRouter();
  const { action, needsAccount } = useFriendInvite(user);
  const { create, creating } = useCreateFeedAccount();

  if (!action) {
    return null;
  }

  const primary = needsAccount
    ? {
        label: t('feed.create_account.button'),
        icon: PersonAddIcon,
        systemImage: 'person.badge.plus' as const,
        disabled: creating,
        onPress: create,
      }
    : {
        label: action,
        icon: CheckIcon,
        systemImage: 'checkmark' as const,
        onPress: () => {
          dispatch(requestFriend({ user, fromUserAction: true }));
          back();
        },
      };

  return <PageActions primaryKind="commit" primary={primary} />;
}
