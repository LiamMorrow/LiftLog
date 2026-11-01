import BackupIcon from '@expo/material-symbols/backup.xml';
import CloudUploadIcon from '@expo/material-symbols/cloud_upload.xml';
import DescriptionIcon from '@expo/material-symbols/description.xml';
import DownloadIcon from '@expo/material-symbols/download.xml';
import HistoryIcon from '@expo/material-symbols/history.xml';
import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import LimitedHtml from '@/components/presentation/foundation/limited-html';
import { SettingsPage } from '@/components/layout/settings-page';
import { SegmentedGroup, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListLink } from '@/components/presentation/foundation/segmented-list-link';
import { useActionEffect } from '@/hooks/useActionEffect';
import { useAppTheme } from '@/hooks/useAppTheme';
import { restoreFeedBackup } from '@/store/feed';
import { beginFeedImport, exportData, importData } from '@/store/settings';
import { setStatsIsDirty } from '@/store/stats';

import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { HealthExportSwitch, useCanExportHealth } from '@/components/smart/health-export-switch';
import { FeedBackupData } from '@/models/backup';

export default function BackupAndRestorePage() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { push } = useRouter();
  const [feedImportDialogOpen, setFeedImportDialogOpen] = useState(false);
  const [feedExportDialogOpen, setFeedExportDialogOpen] = useState(false);
  const canExportHealth = useCanExportHealth();
  return (
    <SettingsPage title={t('backup.export_backup_restore.title')} caption={t('backup.export_backup_restore.subtitle')}>
      <SegmentedGroup>
        <SegmentListFormElement
          label={t('backup.backup_data.title')}
          supportingText={t('backup.backup_data.subtitle')}
          icon={BackupIcon}
          systemImage="externaldrive"
          onPress={() => setFeedExportDialogOpen(true)}
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

      <ImportFeedDialog open={feedImportDialogOpen} setOpen={setFeedImportDialogOpen} />
      <ExportFeedDialog open={feedExportDialogOpen} setOpen={setFeedExportDialogOpen} />
    </SettingsPage>
  );
}

interface DialogProps {
  open: boolean;
  setOpen: (o: boolean) => void;
}

function ImportFeedDialog({ open, setOpen }: DialogProps) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const dispatch = useDispatch();
  const [importedFeedState, setImportedFeedState] = useState<FeedBackupData>();

  const importFeedData = () => {
    if (!importedFeedState) {
      setOpen(false);
      return;
    }
    dispatch(restoreFeedBackup({ ...importedFeedState, fromUserAction: true }));
    setOpen(false);
  };
  useActionEffect(beginFeedImport, (action) => {
    setImportedFeedState(action.payload);
    setOpen(true);
  });
  return (
    <ConfirmationDialog
      headline={t('feed.import_data.confirm.title')}
      textContent={
        <LimitedHtml
          value={t('feed.import_data.confirm.body')}
          emStyles={{ color: colors.error, fontWeight: 'bold' }}
        />
      }
      onOk={importFeedData}
      okText={t('generic.import.button')}
      onCancel={() => setOpen(false)}
      cancelText={t('feed.dont_import.button')}
      open={open}
    />
  );
}

function ExportFeedDialog({ open, setOpen }: DialogProps) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const dispatch = useDispatch();
  const exportWithFeed = () => {
    dispatch(exportData({ includeFeed: true }));
    setOpen(false);
  };
  const exportWithoutFeed = () => {
    dispatch(exportData({ includeFeed: false }));
    setOpen(false);
  };
  return (
    <ConfirmationDialog
      headline={t('feed.backup_account.title')}
      textContent={
        <LimitedHtml
          value={t('feed.backup_account_with_friends.confirm.body')}
          emStyles={{ color: colors.error, fontWeight: 'bold' }}
        />
      }
      okText={t('feed.include_feed.label')}
      onOk={exportWithFeed}
      additionalActionText={t('backup.just_my_data.button')}
      onAdditionalAction={exportWithoutFeed}
      cancelText={t('generic.cancel.button')}
      onCancel={() => setOpen(false)}
      open={open}
    />
  );
}
