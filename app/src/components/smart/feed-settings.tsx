import { SettingsPage } from '@/components/layout/settings-page';
import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import { CreateFeedAccountCard } from '@/components/smart/create-feed-account-card';
import { Remote } from '@/components/presentation/foundation/remote';
import { SegmentedGroup, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSwitch } from '@/components/presentation/foundation/segmented-list-switch';
import { SegmentedListTextInput } from '@/components/presentation/foundation/segmented-list-text-input';
import { FeedIdentity } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { resetFeedAccount, selectFeedIdentityRemote, updateFeedIdentity } from '@/store/feed';
import { getFeedQrCodeHref } from '@/components/smart/feed-qr-code';
import { setShowFeed } from '@/store/settings';
import { useTranslate } from '@tolgee/react';
import { Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

export type FeedSettingsFocus = 'publish' | 'live';

/** Reachable from both the feed and Settings, each in its own tab's stack. */
export function getFeedSettingsHref(opts?: { focus?: FeedSettingsFocus; fromSettings?: boolean }): Href {
  return {
    pathname: opts?.fromSettings ? '/settings/feed' : '/feed/settings',
    params: opts?.focus ? { focus: opts.focus } : {},
  };
}

export function FeedSettings({
  focus,
  fromSettings,
}: {
  focus: FeedSettingsFocus | undefined;
  fromSettings?: boolean;
}) {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const identityRemote = useAppSelector(selectFeedIdentityRemote);
  const showFeed = useAppSelector((x) => x.settings.showFeed);
  const lockedOn = showFeed && identityRemote.isSuccess();
  return (
    <SettingsPage title={t('feed.settings.title')} docs="FeedProcess.md">
      <SegmentedGroup>
        <SegmentedListSwitch
          testID="feed-show-feed-switch"
          icon={'forum'}
          label={t('feed.show_feed.label')}
          supportingText={lockedOn ? t('feed.show_feed.has_account.subtitle') : t('feed.show_feed.subtitle')}
          value={showFeed}
          disabled={lockedOn}
          onValueChange={(value) => dispatch(setShowFeed(value))}
        />
      </SegmentedGroup>
      <Remote
        value={identityRemote}
        notAsked={() => <CreateFeedAccountCard />}
        loading={() => <CreateFeedAccountCard />}
        error={() => <CreateFeedAccountCard />}
        success={(identity) => <FeedSettingsForm identity={identity} focus={focus} fromSettings={fromSettings} />}
      />
    </SettingsPage>
  );
}

function FeedSettingsForm({
  identity,
  focus,
  fromSettings,
}: {
  identity: FeedIdentity;
  focus: FeedSettingsFocus | undefined;
  fromSettings: boolean | undefined;
}) {
  const { push } = useRouter();
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const updateProfile = (value: Partial<FeedIdentity>) => {
    dispatch(updateFeedIdentity({ updates: value, fromUserAction: true }));
  };
  const deleteAccount = () => {
    dispatch(resetFeedAccount({ fromUserAction: true, createNewIdentity: false }));
  };
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  return (
    <>
      <SegmentedGroup>
        <SegmentedListTextInput
          label={t('feed.your_name.label')}
          placeholder={t('generic.optional.label')}
          value={identity.name ?? ''}
          onChangeText={(name) => updateProfile({ name })}
        />
      </SegmentedGroup>
      <SegmentedGroup>
        <SegmentListFormElement
          icon={'share'}
          label={t('feed.share_feed.button')}
          onPress={() => push(getFeedQrCodeHref({ fromSettings }))}
        />
      </SegmentedGroup>
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
      </SegmentedGroup>
      <SegmentedGroup>
        <SegmentListFormElement
          icon={'delete'}
          destructive
          label={t('feed.delete_account.button')}
          onPress={() => setDeleteAccountDialogOpen(true)}
        />
      </SegmentedGroup>
      <ConfirmationDialog
        headline={t('feed.delete_account.button')}
        textContent={t('feed.delete_account.confirm.body')}
        open={deleteAccountDialogOpen}
        onOk={deleteAccount}
        okText={t('feed.delete_account.button')}
        onCancel={() => setDeleteAccountDialogOpen(false)}
      />
    </>
  );
}
