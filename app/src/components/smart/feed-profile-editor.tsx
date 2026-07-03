import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import Form from '@/components/presentation/foundation/form';
import LabelledFormRow from '@/components/presentation/foundation/labelled-form-row';
import ListSwitch from '@/components/presentation/foundation/list-switch';
import { Remote } from '@/components/presentation/foundation/remote';
import { spacing } from '@/hooks/useAppTheme';
import { FeedIdentity } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { resetFeedAccount, selectFeedIdentityRemote, updateFeedIdentity } from '@/store/feed';
import { useTranslate } from '@tolgee/react';
import { Href, Stack } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { List, TextInput } from 'react-native-paper';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import { useDispatch } from 'react-redux';

export function getFeedProfileEditorHref(opts?: { focusPublish?: boolean }): Href {
  return `/feed/profile-editor${opts?.focusPublish ? '?focusPublish=1' : ''}` as Href;
}

export function FeedProfileEditor({ focusPublish }: { focusPublish: boolean }) {
  const { t } = useTranslate();
  const identityRemote = useAppSelector(selectFeedIdentityRemote);
  return (
    <FullHeightScrollView avoidKeyboard scrollStyle={{ padding: spacing.pageHorizontalMargin }}>
      <Stack.Screen options={{ title: t('feed.manage.title') }} />
      <Remote
        value={identityRemote}
        success={(identity) => <FeedProfileForm identity={identity} focusPublish={focusPublish} />}
      />
    </FullHeightScrollView>
  );
}

function FeedProfileForm({ identity, focusPublish }: { identity: FeedIdentity; focusPublish: boolean }) {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const updateProfile = (value: Partial<FeedIdentity>) => {
    dispatch(updateFeedIdentity({ updates: value, fromUserAction: true }));
  };
  const resetAccount = () => {
    dispatch(resetFeedAccount({ fromUserAction: true }));
  };
  const [resetAccountDialogOpen, setResetAccountDialogOpen] = useState(false);
  return (
    <View
      style={{
        gap: spacing[2],
        marginHorizontal: -spacing.pageHorizontalMargin,
      }}
    >
      <Form>
        <LabelledFormRow icon={'personFill'} label={t('feed.your_name.label')}>
          <TextInput
            placeholder={t('generic.optional.label')}
            value={identity.name ?? ''}
            label={t('generic.optional.label')}
            mode="outlined"
            onChangeText={(name) => updateProfile({ name })}
          />
        </LabelledFormRow>
      </Form>
      <List.Section>
        <ListSwitch
          testID="feed-publish-workouts-switch"
          focus={focusPublish}
          headline={t('feed.publish_workout.label')}
          supportingText={t('feed.publish_workout.subtitle')}
          value={identity.publishWorkouts}
          onValueChange={(publishWorkouts) => updateProfile({ publishWorkouts })}
        />
        <ListSwitch
          headline={t('feed.publish_bodyweight.label')}
          supportingText={t('feed.publish_bodyweight.subtitle')}
          value={identity.publishBodyweight}
          onValueChange={(publishBodyweight) => updateProfile({ publishBodyweight })}
        />
        <ListSwitch
          headline={t('feed.publish_plan.label')}
          supportingText={t('feed.publish_plan.subtitle')}
          value={identity.publishPlan}
          onValueChange={(publishPlan) => updateProfile({ publishPlan })}
        />
      </List.Section>
      <Button onPress={() => setResetAccountDialogOpen(true)}>{t('feed.reset_account.button')}</Button>
      <ConfirmationDialog
        headline={t('feed.reset_account.button')}
        textContent={t('feed.reset_account.confirm.body')}
        open={resetAccountDialogOpen}
        onOk={resetAccount}
        okText={t('feed.reset_account.button')}
        onCancel={() => setResetAccountDialogOpen(false)}
      />
    </View>
  );
}
