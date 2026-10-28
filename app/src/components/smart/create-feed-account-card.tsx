import Button from '@/components/presentation/foundation/button';
import CardActions from '@/components/presentation/foundation/card-actions';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { createFeedIdentity, selectFeedIdentityRemote } from '@/store/feed';
import { T } from '@tolgee/react';
import { Card } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export function useCreateFeedAccount() {
  const dispatch = useDispatch();
  const creating = useAppSelector(selectFeedIdentityRemote).isLoading();
  const create = () => {
    dispatch(
      createFeedIdentity({
        name: undefined,
        publishBodyweight: false,
        publishWorkouts: false,
        fromUserAction: true,
      }),
    );
  };
  return { create, creating };
}

export function CreateFeedAccountCard() {
  const { create, creating } = useCreateFeedAccount();
  return (
    <Card mode="contained" style={{ marginBottom: spacing[2] }}>
      <Card.Content>
        <SurfaceText>
          <T keyName="feed.create_account.body" />
        </SurfaceText>
      </Card.Content>
      <CardActions>
        <Button
          testID="feed-create-account-button"
          mode="contained"
          icon={'personAdd'}
          loading={creating}
          disabled={creating}
          onPress={create}
        >
          <T keyName="feed.create_account.button" />
        </Button>
      </CardActions>
    </Card>
  );
}
