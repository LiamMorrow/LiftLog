import { SettingsPage } from '@/components/layout/settings-page';
import { SegmentedGroup, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListLink } from '@/components/presentation/foundation/segmented-list-link';
import AppIcon from '@/components/presentation/foundation/icon';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { T, useTranslate } from '@tolgee/react';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, View } from 'react-native';
import { Text, Badge, Dialog, Icon, Portal } from 'react-native-paper';
import Button from '@/components/presentation/foundation/button';
import * as Application from 'expo-application';
import { useDispatch } from 'react-redux';
import { openUrl } from '@/utils/open-url';
import { copyLogs } from '@/store/app';
import { useAppSelector } from '@/store';
import { selectHasUnseenWhatsNew } from '@/store/settings';

export default function SettingsPageIndex() {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const { push } = useRouter();
  const [appInfoOpen, setAppInfoOpen] = useState(false);
  const dispatch = useDispatch();
  const hasUnseenWhatsNew = useAppSelector(selectHasUnseenWhatsNew);

  const doCopyLogs = () => {
    dispatch(copyLogs());
  };

  const appVersion = Application.nativeApplicationVersion ?? Application.nativeBuildVersion ?? 'Unknown';

  const bugReportUrl = `https://github.com/LiamMorrow/LiftLog/issues/new?assignees=&labels=bug&projects=&template=bug_report.yaml&app-version=${encodeURIComponent(appVersion)}&platform=${Platform.OS}&os-version=${Platform.Version}`;

  const externalLink = <AppIcon source="openInBrowser" size={20} />;

  return (
    <SettingsPage title={t('settings.settings.title')}>
      <SegmentedGroup>
        <SegmentedListLink
          label={t('plan.manage.title')}
          icon={'assignment'}
          onPress={() => push('/settings/program-list')}
        />
        <SegmentedListLink
          label={t('exercise.manage.button')}
          icon={'directionsRun'}
          onPress={() => push('/settings/manage-exercises')}
        />
        <SegmentedListLink label={t('ai.planner.title')} icon={'bolt'} onPress={() => push('/settings/ai/planner')} />
      </SegmentedGroup>

      <SegmentedGroup>
        <SegmentedListLink
          testID="appConfiguration"
          label={t('settings.app_configuration.title')}
          icon={'settings'}
          onPress={() => push('/settings/app-configuration')}
        />
        <SegmentedListLink
          testID="localization"
          label={t('settings.localisation.title')}
          icon={'language'}
          onPress={() => push('/settings/localization')}
        />
        <SegmentedListLink
          label={t('settings.notifications.title')}
          icon={'notifications'}
          onPress={() => push('/settings/notifications')}
        />
      </SegmentedGroup>

      <SegmentedGroup>
        <SegmentedListLink label={t('backends.title')} icon={'dns'} onPress={() => push('/settings/backends')} />
        <SegmentedListLink
          label={t('backup.export_backup_restore.title')}
          icon={'settingsBackupRestore'}
          onPress={() => push('/settings/backup-and-restore')}
        />
      </SegmentedGroup>

      <SegmentedGroup>
        <SegmentListFormElement
          label={t('settings.feature_request.title')}
          icon={'star'}
          onPress={() => openUrl('https://github.com/LiamMorrow/LiftLog/discussions')}
          right={externalLink}
        />
        <SegmentListFormElement
          label={t('settings.bug_report.title')}
          icon={'bugReport'}
          onPress={() => openUrl(bugReportUrl)}
          right={externalLink}
        />
        <SegmentListFormElement label={t('settings.copy_logs.title')} icon={'terminal'} onPress={doCopyLogs} />
        <SegmentListFormElement
          label={t('settings.translation.title')}
          icon={'translate'}
          onPress={() => openUrl('https://translate.liftlog.online')}
          right={externalLink}
        />
      </SegmentedGroup>

      <SegmentedGroup>
        <SegmentListFormElement
          label={t('whats_new.title')}
          icon={'campaign'}
          onPress={() => push('/settings/whats-new')}
          right={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
              {hasUnseenWhatsNew ? <Badge size={10} /> : undefined}
              <AppIcon source="chevronRight" size={20} color={colors.onSurfaceVariant} />
            </View>
          }
        />
        <SegmentListFormElement
          label={t('settings.app_info.title')}
          icon={'info'}
          onPress={() => setAppInfoOpen(true)}
        />
      </SegmentedGroup>

      <Portal>
        <Dialog visible={appInfoOpen} onDismiss={() => setAppInfoOpen(false)}>
          <Dialog.Title>
            <T keyName="settings.app_info.title" />
          </Dialog.Title>
          <Dialog.Content>
            <Text>
              LiftLog is an entirely open source app, licensed under the AGPL-3.0 license. You can find the source code
              on{' '}
              <Link style={{ color: colors.primary, fontWeight: 'bold' }} href="https://github.com/LiamMorrow/LiftLog">
                <Icon size={16} source={'share'} color={colors.primary} />
                GitHub
              </Link>
              .
            </Text>
            <Text>LiftLog is currently version {appVersion}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAppInfoOpen(false)}>
              <T keyName="generic.close.button" />
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SettingsPage>
  );
}
