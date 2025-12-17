import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import LimitedHtml from '@/components/presentation/limited-html';
import { Remote } from '@/components/presentation/remote';
import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { RemoteData } from '@/models/remote';
import { useAppSelector } from '@/store';
import {
  fetchAndSetSharedFeedUser,
  requestFollowUser,
  selectSharedFeedUser,
  setSharedFeedUser,
} from '@/store/feed';
import { useTranslate } from '@tolgee/react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { Card, Icon } from 'react-native-paper';
import Button from '@/components/presentation/gesture-wrappers/button';
import { useDispatch } from 'react-redux';

export default function FeedSharePage() {
  const { t } = useTranslate();
  const { id, name } = useLocalSearchParams<{
    id?: string;
    name?: string;
  }>();
  const dispatch = useDispatch();
  const { back } = useRouter();

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

  const handleAcceptRequest = () => {
    dispatch(requestFollowUser({ fromUserAction: true }));
    back();
  };

  return (
    <FullHeightScrollView>
      <Stack.Screen options={{ title: t('feed.feed.title') }} />
      <Remote
        retry={fetchUser}
        value={sharedProfileRemote}
        success={(sharedProfile) => (
          <View style={{ padding: spacing.pageHorizontalMargin }}>
            <Card mode="contained">
              <Card.Title
                left={({ size }) => <Icon source={'personFill'} size={size} />}
                title={t('feed.profile_share_request.title')}
                titleVariant="headlineSmall"
              />
              <Card.Content style={{ gap: spacing[4] }}>
                <SurfaceText style={{ textAlign: 'center' }}>
                  <LimitedHtml
                    value={t('feed.user_wants_to_share_profile.message', {
                      user: sharedProfile.displayName || 'Anonymous user',
                    })}
                  />
                </SurfaceText>

                <SurfaceText
                  style={{ textAlign: 'center' }}
                  color="onSurfaceVariant"
                >
                  {t('feed.accept_to_follow.explanation')}
                </SurfaceText>
              </Card.Content>

              <Card.Actions
                style={{
                  justifyContent: 'center',
                  padding: spacing[4],
                }}
              >
                <Button
                  mode="outlined"
                  onPress={() => back()}
                  style={{ marginRight: spacing[2] }}
                >
                  {t('generic.cancel.button')}
                </Button>
                <Button
                  testID="feed-share-accept-button"
                  mode="contained"
                  onPress={handleAcceptRequest}
                  icon="check"
                >
                  {t('generic.accept.button')}
                </Button>
              </Card.Actions>
            </Card>
          </View>
        )}
      />
    </FullHeightScrollView>
  );
}
