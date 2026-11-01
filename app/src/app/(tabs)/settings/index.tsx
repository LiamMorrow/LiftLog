import { NativeIcon } from '@/components/presentation/foundation/native-icon';
import OpenInBrowserIcon from '@expo/material-symbols/open_in_browser.xml';
import ChevronRightIcon from '@expo/material-symbols/chevron_right.xml';
import AssignmentIcon from '@expo/material-symbols/assignment.xml';
import BoltIcon from '@expo/material-symbols/bolt.xml';
import BugReportIcon from '@expo/material-symbols/bug_report.xml';
import CampaignIcon from '@expo/material-symbols/campaign.xml';
import DirectionsRunIcon from '@expo/material-symbols/directions_run.xml';
import DnsIcon from '@expo/material-symbols/dns.xml';
import ForumIcon from '@expo/material-symbols/forum.xml';
import InfoIcon from '@expo/material-symbols/info.xml';
import LanguageIcon from '@expo/material-symbols/language.xml';
import NotificationsIcon from '@expo/material-symbols/notifications.xml';
import SettingsBackupRestoreIcon from '@expo/material-symbols/settings_backup_restore.xml';
import SettingsIcon from '@expo/material-symbols/settings.xml';
import StarIcon from '@expo/material-symbols/star.xml';
import TerminalIcon from '@expo/material-symbols/terminal.xml';
import TranslateIcon from '@expo/material-symbols/translate.xml';
import { SettingsPage } from '@/components/layout/settings-page';
import { SegmentedGroup, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListLink } from '@/components/presentation/foundation/segmented-list-link';
import { Icon as AppIcon } from '@/components/presentation/foundation/icon';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { T, useTranslate } from '@tolgee/react';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { Dialog, Portal } from 'react-native-paper';
import Button from '@/components/presentation/foundation/button';
import * as Application from 'expo-application';
import { useDispatch } from 'react-redux';
import { openUrl } from '@/utils/open-url';
import { copyLogs } from '@/store/app';
import { useAppSelector } from '@/store';
import { selectHasUnseenWhatsNew } from '@/store/settings';
import { getFeedSettingsHref } from '@/components/smart/feed-settings';

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

  const externalLink = <NativeIcon icon={OpenInBrowserIcon} systemImage="arrow.up.right.square" size={20} />;

  return (
    <SettingsPage title={t('settings.settings.title')}>
      <SegmentedGroup>
        <SegmentedListLink
          label={t('plan.manage.title')}
          icon={AssignmentIcon}
          systemImage="doc.text"
          onPress={() => push('/settings/program-list')}
        />
        <SegmentedListLink
          label={t('exercise.manage.button')}
          icon={DirectionsRunIcon}
          systemImage="figure.run"
          onPress={() => push('/settings/manage-exercises')}
        />
        <SegmentedListLink
          label={t('ai.planner.title')}
          icon={BoltIcon}
          systemImage="bolt"
          onPress={() => push('/settings/ai/planner')}
        />
      </SegmentedGroup>

      <SegmentedGroup>
        <SegmentedListLink
          testID="appConfiguration"
          label={t('settings.app_configuration.title')}
          icon={SettingsIcon}
          systemImage="gearshape"
          onPress={() => push('/settings/app-configuration')}
        />
        <SegmentedListLink
          testID="localization"
          label={t('settings.localisation.title')}
          icon={LanguageIcon}
          systemImage="globe"
          onPress={() => push('/settings/localization')}
        />
        <SegmentedListLink
          label={t('settings.notifications.title')}
          icon={NotificationsIcon}
          systemImage="bell"
          onPress={() => push('/settings/notifications')}
        />
        <SegmentedListLink
          label={t('feed.settings.title')}
          icon={ForumIcon}
          systemImage="bubble.left.and.bubble.right"
          onPress={() => push(getFeedSettingsHref({ fromSettings: true }))}
        />
      </SegmentedGroup>

      <SegmentedGroup>
        <SegmentedListLink
          label={t('backends.title')}
          icon={DnsIcon}
          systemImage="server.rack"
          onPress={() => push('/settings/backends')}
        />
        <SegmentedListLink
          label={t('backup.export_backup_restore.title')}
          icon={SettingsBackupRestoreIcon}
          systemImage="clock.arrow.circlepath"
          onPress={() => push('/settings/backup-and-restore')}
        />
      </SegmentedGroup>

      <SegmentedGroup>
        <SegmentListFormElement
          label={t('settings.feature_request.title')}
          icon={StarIcon}
          systemImage="star"
          onPress={() => openUrl('https://github.com/LiamMorrow/LiftLog/discussions')}
          right={externalLink}
        />
        <SegmentListFormElement
          label={t('settings.bug_report.title')}
          icon={BugReportIcon}
          systemImage="ladybug"
          onPress={() => openUrl(bugReportUrl)}
          right={externalLink}
        />
        <SegmentListFormElement
          label={t('settings.copy_logs.title')}
          icon={TerminalIcon}
          systemImage="apple.terminal"
          onPress={doCopyLogs}
        />
        <SegmentListFormElement
          label={t('settings.translation.title')}
          icon={TranslateIcon}
          systemImage="character.bubble"
          onPress={() => openUrl('https://translate.liftlog.online')}
          right={externalLink}
        />
      </SegmentedGroup>

      <SegmentedGroup>
        <SegmentListFormElement
          label={t('whats_new.title')}
          icon={CampaignIcon}
          systemImage="megaphone"
          onPress={() => push('/settings/whats-new')}
          right={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
              {hasUnseenWhatsNew ? (
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error }} />
              ) : undefined}
              <NativeIcon
                icon={ChevronRightIcon}
                systemImage="chevron.right"
                size={20}
                mirrored
                color={colors.onSurfaceVariant}
              />
            </View>
          }
        />
        <SegmentListFormElement
          label={t('settings.app_info.title')}
          icon={InfoIcon}
          systemImage="info.circle"
          onPress={() => setAppInfoOpen(true)}
        />
      </SegmentedGroup>

      <Portal>
        <Dialog visible={appInfoOpen} onDismiss={() => setAppInfoOpen(false)}>
          <Dialog.Title>
            <T keyName="settings.app_info.title" />
          </Dialog.Title>
          <Dialog.Content>
            <AppText>
              LiftLog is an entirely open source app, licensed under the AGPL-3.0 license. You can find the source code
              on{' '}
              <Link style={{ color: colors.primary, fontWeight: 'bold' }} href="https://github.com/LiamMorrow/LiftLog">
                <AppIcon size={16} source={'share'} color={colors.primary} />
                GitHub
              </Link>
              .
            </AppText>
            <AppText>LiftLog is currently version {appVersion}</AppText>
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
