import { NativeButton } from '@/components/presentation/foundation/native-button';
import PersonAddIcon from '@expo/material-symbols/person_add.xml';
import { Card, CardContent } from '@/components/presentation/foundation/card';
import CardActions from '@/components/presentation/foundation/card-actions';
import { AppText } from '@/components/presentation/foundation/app-text';
import { spacing } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { createFeedIdentity, selectFeedIdentityRemote } from '@/store/feed';
import { T, useTranslate } from '@tolgee/react';

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
  const { t } = useTranslate();
  return (
    <Card style={{ marginBottom: spacing[2] }}>
      <CardContent style={{ paddingBottom: 0 }}>
        <AppText variant="bodyLarge">
          <T keyName="feed.create_account.body" />
        </AppText>
      </CardContent>
      <CardActions>
        <NativeButton
          testID="feed-create-account-button"
          icon={PersonAddIcon}
          systemImage="person.badge.plus"
          loading={creating}
          label={t('feed.create_account.button')}
          onPress={create}
        />
      </CardActions>
    </Card>
  );
}
