import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import LimitedHtml from '@/components/presentation/foundation/limited-html';
import { Remote } from '@/components/presentation/foundation/remote';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { SharedFeedUser } from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { useAppSelector } from '@/store';
import {
  fetchAndSetSharedFeedUser,
  requestFriend,
  selectOwnFeedUserId,
  selectSharedFeedUser,
  setSharedFeedUser,
} from '@/store/feed';
import { useTranslate } from '@tolgee/react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { Card, Icon } from 'react-native-paper';
import Button from '@/components/presentation/foundation/button';
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

  return (
    <FullHeightScrollView>
      <Stack.Screen options={{ title: t('feed.feed.title') }} />
      <Remote retry={fetchUser} value={sharedProfileRemote} success={(user) => <AddFriendCard user={user} />} />
    </FullHeightScrollView>
  );
}

function AddFriendCard({ user }: { user: SharedFeedUser }) {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { back } = useRouter();
  const ownUserId = useAppSelector(selectOwnFeedUserId);
  const existing = useAppSelector((x) => x.feed.friends[user.id]);
  const displayName = user.name || t('feed.anonymous_user.label');

  const send = () => {
    dispatch(requestFriend({ user, fromUserAction: true }));
    back();
  };

  const { message, explanation, action } = match({ isOwn: user.id === ownUserId, status: existing?.status })
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

  return (
    <View style={{ padding: spacing.pageHorizontalMargin }}>
      <Card mode="contained">
        <Card.Title
          left={({ size }) => <Icon source={'personAdd'} size={size} />}
          title={t('feed.add_friend.title')}
          titleVariant="headlineSmall"
        />
        <Card.Content style={{ gap: spacing[4] }}>
          <SurfaceText style={{ textAlign: 'center' }}>
            <LimitedHtml value={message} />
          </SurfaceText>
          {explanation ? (
            <SurfaceText style={{ textAlign: 'center' }} color="onSurfaceVariant">
              <LimitedHtml value={explanation} />
            </SurfaceText>
          ) : null}
        </Card.Content>

        <Card.Actions style={{ justifyContent: 'center', padding: spacing[4] }}>
          <Button mode="outlined" onPress={() => back()} style={{ marginRight: spacing[2] }}>
            {action ? t('generic.cancel.button') : t('generic.close.button')}
          </Button>
          {action ? (
            <Button testID="feed-share-accept-button" mode="contained" onPress={send} icon="check">
              {action}
            </Button>
          ) : null}
        </Card.Actions>
      </Card>
    </View>
  );
}
