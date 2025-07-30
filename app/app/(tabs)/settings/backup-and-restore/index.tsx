import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import LimitedHtml from '@/components/presentation/limited-html';
import ListSwitch from '@/components/presentation/list-switch';
import { LiftLog } from '@/gen/proto';
import { useActionEffect } from '@/hooks/useActionEffect';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fromFeedStateDao } from '@/models/storage/conversions.from-dao';
import { useAppSelector } from '@/store';
import { patchFeedState } from '@/store/feed';
import {
  beginFeedImport,
  exportData,
  importData,
  setBackupReminder,
} from '@/store/settings';
import { setStatsIsDirty } from '@/store/stats';
import { T, useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { List } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function BackupAndRestorePage() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const backupReminders = useAppSelector((s) => s.settings.backupReminder);
  const { push } = useRouter();
  const [feedImportDialogOpen, setFeedImportDialogOpen] = useState(false);
  const [feedExportDialogOpen, setFeedExportDialogOpen] = useState(false);
  return (
    <FullHeightScrollView>
      <Stack.Screen options={{ title: t('ExportBackupRestore') }} />
      <List.Section>
        <List.Item
          title={t('BackUpData')}
          description={t('BackUpDataSubtitle')}
          left={(props) => <List.Icon icon={'backup'} {...props} />}
          onPress={() => setFeedExportDialogOpen(true)}
        ></List.Item>
        <List.Item
          title={t('RestoreData')}
          description={t('RestoreDataSubtitle')}
          left={(props) => <List.Icon icon={'history'} {...props} />}
          onPress={() => {
            dispatch(importData());
            dispatch(setStatsIsDirty(true));
          }}
        ></List.Item>
        <List.Item
          title={t('AutomaticRemoteBackup')}
          description={t('AutomaticRemoteBackupSubtitle')}
          left={(props) => <List.Icon icon={'cloudUpload'} {...props} />}
          onPress={() =>
            push('/(tabs)/settings/backup-and-restore/remote-backup')
          }
        ></List.Item>
        <List.Item
          title={t('PlaintextExport')}
          description={t('PlaintextExportSubtitle')}
          left={(props) => <List.Icon icon={'description'} {...props} />}
          onPress={() =>
            push('/(tabs)/settings/backup-and-restore/plain-text-export')
          }
        ></List.Item>
        <ListSwitch
          headline={<T keyName="BackupReminders" />}
          supportingText={<T keyName="BackupRemindersSubtitle" />}
          value={backupReminders}
          onValueChange={(value) => dispatch(setBackupReminder(value))}
        />
      </List.Section>
      <ImportFeedDialog
        open={feedImportDialogOpen}
        setOpen={setFeedImportDialogOpen}
      />
      <ExportFeedDialog
        open={feedExportDialogOpen}
        setOpen={setFeedExportDialogOpen}
      />
    </FullHeightScrollView>
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
  const [importedFeedState, setImportedFeedState] =
    useState<LiftLog.Ui.Models.IFeedStateDaoV1>();

  const importFeedData = () => {
    if (!importedFeedState) {
      setOpen(false);
      return;
    }
    dispatch(patchFeedState(fromFeedStateDao(importedFeedState)));
    setOpen(false);
  };
  useActionEffect(beginFeedImport, (action) => {
    setImportedFeedState(action.payload);
    setOpen(true);
  });
  return (
    <ConfirmationDialog
      headline={t('ImportFeedDataQuestion')}
      textContent={
        <LimitedHtml
          value={t('ImportFeedDataQuestionMessage')}
          emStyles={{ color: colors.error, fontWeight: 'bold' }}
        />
      }
      onOk={importFeedData}
      okText={t('Import')}
      onCancel={() => setOpen(false)}
      cancelText={t("Don't import feed")}
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
      headline={t('BackupFeedAccount')}
      textContent={
        <LimitedHtml
          value={t('BackupFeedAccountMessage')}
          emStyles={{ color: colors.error, fontWeight: 'bold' }}
        />
      }
      okText={t('IncludeFeed')}
      onOk={exportWithFeed}
      additionalActionText={t('JustMyData')}
      onAdditionalAction={exportWithoutFeed}
      cancelText={t('Cancel')}
      onCancel={() => setOpen(false)}
      open={open}
    />
  );
}
