import { SettingsPage } from '@/components/layout/settings-page';
import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import { FormRow } from '@/components/presentation/foundation/form-row';
import { Remote } from '@/components/presentation/foundation/remote';
import { SegmentedGroup, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSwitch } from '@/components/presentation/foundation/segmented-list-switch';
import { FeedIdentity } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { resetFeedAccount, selectFeedIdentityRemote, updateFeedIdentity } from '@/store/feed';
import { useTranslate } from '@tolgee/react';
import { Href } from 'expo-router';
import { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export type FeedSettingsFocus = 'publish' | 'live';

/** Reachable from both the feed and Settings, each in its own tab's stack. */
export function getFeedSettingsHref(opts?: { focus?: FeedSettingsFocus; fromSettings?: boolean }): Href {
  return {
    pathname: opts?.fromSettings ? '/settings/feed' : '/feed/settings',
    params: opts?.focus ? { focus: opts.focus } : {},
  };
}

export function FeedSettings({ focus }: { focus: FeedSettingsFocus | undefined }) {
  const { t } = useTranslate();
  const identityRemote = useAppSelector(selectFeedIdentityRemote);
  return (
    <SettingsPage title={t('feed.settings.title')} docs="FeedProcess.md">
      <Remote value={identityRemote} success={(identity) => <FeedSettingsForm identity={identity} focus={focus} />} />
    </SettingsPage>
  );
}

function FeedSettingsForm({ identity, focus }: { identity: FeedIdentity; focus: FeedSettingsFocus | undefined }) {
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
    <>
      <FormRow>
        <TextInput
          label={t('feed.your_name.label')}
          placeholder={t('generic.optional.label')}
          value={identity.name ?? ''}
          mode="outlined"
          onChangeText={(name) => updateProfile({ name })}
        />
      </FormRow>
      <SegmentedGroup>
        <SegmentedListSwitch
          testID="feed-publish-workouts-switch"
          icon={'fitnessCenter'}
          focus={focus === 'publish'}
          label={t('feed.publish_workout.label')}
          supportingText={t('feed.publish_workout.subtitle')}
          value={identity.publishWorkouts}
          onValueChange={(publishWorkouts) => updateProfile({ publishWorkouts })}
        />
        <SegmentedListSwitch
          testID="feed-share-live-workouts-switch"
          icon={'podcasts'}
          focus={focus === 'live'}
          label={t('feed.share_live_workouts.label')}
          supportingText={t('feed.share_live_workouts.subtitle')}
          value={identity.sharesLiveWorkouts}
          disabled={!identity.publishWorkouts}
          onValueChange={(shareLiveWorkouts) => updateProfile({ shareLiveWorkouts })}
        />
        <SegmentedListSwitch
          icon={'monitorWeight'}
          label={t('feed.publish_bodyweight.label')}
          supportingText={t('feed.publish_bodyweight.subtitle')}
          value={identity.publishBodyweight}
          onValueChange={(publishBodyweight) => updateProfile({ publishBodyweight })}
        />
        <SegmentedListSwitch
          icon={'assignment'}
          label={t('feed.publish_plan.label')}
          supportingText={t('feed.publish_plan.friends.subtitle')}
          value={identity.publishPlan}
          onValueChange={(publishPlan) => updateProfile({ publishPlan })}
        />
      </SegmentedGroup>
      <SegmentedGroup>
        <SegmentListFormElement
          icon={'delete'}
          label={t('feed.reset_account.button')}
          onPress={() => setResetAccountDialogOpen(true)}
        />
      </SegmentedGroup>
      <ConfirmationDialog
        headline={t('feed.reset_account.button')}
        textContent={t('feed.reset_account.confirm.body')}
        open={resetAccountDialogOpen}
        onOk={resetAccount}
        okText={t('feed.reset_account.button')}
        onCancel={() => setResetAccountDialogOpen(false)}
      />
    </>
  );
}
