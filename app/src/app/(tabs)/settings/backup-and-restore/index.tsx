import BackupIcon from '@expo/material-symbols/backup.xml';
import CloudUploadIcon from '@expo/material-symbols/cloud_upload.xml';
import DescriptionIcon from '@expo/material-symbols/description.xml';
import DownloadIcon from '@expo/material-symbols/download.xml';
import HistoryIcon from '@expo/material-symbols/history.xml';
import { SettingsPage } from '@/components/layout/settings-page';
import { SegmentedGroup, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListLink } from '@/components/presentation/foundation/segmented-list-link';
import { useActionEffect } from '@/hooks/useActionEffect';
import { useConfirm } from '@/hooks/useConfirm';
import { restoreFeedBackup } from '@/store/feed';
import { beginFeedImport, exportData, importData } from '@/store/settings';
import { setStatsIsDirty } from '@/store/stats';

import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { HealthExportSwitch, useCanExportHealth } from '@/components/smart/health-export-switch';

export default function BackupAndRestorePage() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { push } = useRouter();
  const confirm = useConfirm();
  useActionEffect(beginFeedImport, (action) =>
    confirm({
      title: t('feed.import_data.confirm.title'),
      message: t('feed.import_data.confirm.body'),
      okText: t('generic.import.button'),
      cancelText: t('feed.dont_import.button'),
      onOk: () => dispatch(restoreFeedBackup({ ...action.payload, fromUserAction: true })),
    }),
  );
  const backUp = () =>
    confirm({
      title: t('feed.backup_account.title'),
      message: t('feed.backup_account_with_friends.confirm.body'),
      okText: t('feed.include_feed.label'),
      onOk: () => dispatch(exportData({ includeFeed: true })),
      additionalAction: {
        text: t('backup.just_my_data.button'),
        onPress: () => dispatch(exportData({ includeFeed: false })),
      },
    });
  const canExportHealth = useCanExportHealth();
  return (
    <SettingsPage title={t('backup.export_backup_restore.title')} caption={t('backup.export_backup_restore.subtitle')}>
      <SegmentedGroup>
        <SegmentListFormElement
          label={t('backup.backup_data.title')}
          supportingText={t('backup.backup_data.subtitle')}
          icon={BackupIcon}
          systemImage="externaldrive"
          onPress={backUp}
        />
        <SegmentListFormElement
          label={t('backup.restore_data.title')}
          supportingText={t('backup.restore_data.subtitle')}
          icon={HistoryIcon}
          systemImage="clock.arrow.circlepath"
          onPress={() => {
            dispatch(importData());
            dispatch(setStatsIsDirty(true));
          }}
        />
      </SegmentedGroup>

      <SegmentedGroup>
        <SegmentedListLink
          label={t('backup.automatic_remote.title')}
          supportingText={t('backup.automatic_remote.subtitle')}
          icon={CloudUploadIcon}
          systemImage="icloud.and.arrow.up"
          onPress={() => push('/settings/backup-and-restore/remote-backup')}
        />
        <SegmentedListLink
          label={t('backup.import_from_other_apps.title')}
          supportingText={t('backup.import_from_other_apps.subtitle')}
          icon={DownloadIcon}
          systemImage="square.and.arrow.down"
          onPress={() => push('/settings/backup-and-restore/import-from-other-apps')}
        />
        <SegmentedListLink
          label={t('backup.plaintext_export.title')}
          supportingText={t('backup.plaintext_export.subtitle')}
          icon={DescriptionIcon}
          systemImage="doc.text"
          onPress={() => push('/settings/backup-and-restore/plain-text-export')}
        />
      </SegmentedGroup>

      {canExportHealth ? (
        <SegmentedGroup>
          <HealthExportSwitch />
        </SegmentedGroup>
      ) : undefined}
    </SettingsPage>
  );
}
