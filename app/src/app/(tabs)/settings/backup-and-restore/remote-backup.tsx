import { SettingsPage } from '@/components/layout/settings-page';
import { useAppSelector } from '@/store';
import { executeRemoteBackup, setBackupIncludeFeedAccount } from '@/store/settings';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { SegmentedGroup, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSwitch } from '@/components/presentation/foundation/segmented-list-switch';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import { BackendPicker } from '@/components/smart/backend-picker';
import PlayIcon from '@expo/material-symbols/play_arrow.xml';
import DnsIcon from '@expo/material-symbols/dns.xml';

export default function RemoteBackupPage() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const router = useRouter();
  const includeFeedAccount = useAppSelector((s) => s.settings.backupIncludeFeedAccount);
  const assignedBackend = useAppSelector((s) => s.backends.assignments.backup);

  return (
    <SettingsPage
      title={t('backup.automatic_remote.title')}
      caption={t('backup.remote.explanation')}
      docs="RemoteBackup.md"
      actions={
        <PageActions
          primary={{
            label: t('generic.test.button'),
            onPress: () => dispatch(executeRemoteBackup({ force: true })),
            icon: PlayIcon,
            systemImage: 'play',
            disabled: !assignedBackend,
          }}
          secondary={[
            {
              label: t('backends.manage.button'),
              onPress: () => router.push('/settings/backends'),
              icon: DnsIcon,
              systemImage: 'server.rack',
            },
          ]}
        />
      }
    >
      <SegmentedGroup>
        <SegmentListFormElement
          label={t('backends.backup.label')}
          icon={'cloudUploadFill'}
          right={<BackendPicker feature="backup" />}
        />
        <SegmentedListSwitch
          label={t('feed.backup_account.title')}
          supportingText={t('feed.backup_account.subtitle')}
          icon={'vpnKeyFill'}
          value={includeFeedAccount}
          onValueChange={(value) => dispatch(setBackupIncludeFeedAccount(value))}
        />
      </SegmentedGroup>
    </SettingsPage>
  );
}
