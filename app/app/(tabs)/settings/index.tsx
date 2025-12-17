import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';

import { useAppTheme } from '@/hooks/useAppTheme';
import { T, useTranslate } from '@tolgee/react';
import { Link, Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Platform } from 'react-native';
import { Text, Dialog, Icon, List, Portal } from 'react-native-paper';
import Button from '@/components/presentation/gesture-wrappers/button';
import * as Application from 'expo-application';

export default function Settings() {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const { push } = useRouter();
  const [appInfoOpen, setAppInfoOpen] = useState(false);

  const openUrl = (url: string) => {
    void Linking.canOpenURL(url).then(() => Linking.openURL(url));
  };

  const appVersion =
    Application.nativeApplicationVersion ??
    Application.nativeBuildVersion ??
    'Unknown';

  const bugReportUrl = `https://github.com/LiamMorrow/LiftLog/issues/new?assignees=&labels=bug&projects=&template=bug_report.yaml&app-version=${encodeURIComponent(appVersion)}&platform=${Platform.OS}&os-version=${Platform.Version}`;

  return (
    <FullHeightScrollView>
      <Stack.Screen options={{ title: t('settings.settings.title') }} />
      <List.Section title={t('settings.configuration.title')}>
        <List.Item
          onPress={() => push('/(tabs)/settings/program-list')}
          title={t('plan.manage.title')}
          description={t('plan.manage.subtitle')}
          left={(props) => <List.Icon icon={'assignment'} {...props} />}
        ></List.Item>
        <List.Item
          onPress={() => push('/(tabs)/settings/manage-exercises')}
          title={t('exercise.manage.button')}
          description={t('exercise.manage.subtitle')}
          left={(props) => <List.Icon icon={'directionsRun'} {...props} />}
        ></List.Item>
        <List.Item
          testID="appConfiguration"
          onPress={() => push('/(tabs)/settings/app-configuration')}
          title={t('settings.app_configuration.title')}
          description={t('settings.app_configuration.subtitle')}
          left={(props) => <List.Icon icon={'settings'} {...props} />}
        ></List.Item>
        <List.Item
          testID="localization"
          onPress={() => push('/(tabs)/settings/localization')}
          title={t('settings.localisation.title')}
          description={t('settings.localisation.subtitle')}
          left={(props) => <List.Icon icon={'language'} {...props} />}
        ></List.Item>

        <List.Item
          onPress={() => push('/(tabs)/settings/notifications')}
          title={t('settings.notifications.title')}
          description={t('settings.notifications.subtitle')}
          left={(props) => <List.Icon icon={'notifications'} {...props} />}
        ></List.Item>

        <List.Item
          onPress={() => push('/(tabs)/settings/backup-and-restore')}
          title={t('backup.export_backup_restore.title')}
          description={t('backup.export_backup_restore.subtitle')}
          left={(props) => (
            <List.Icon icon={'settingsBackupRestore'} {...props} />
          )}
        ></List.Item>
      </List.Section>

      <List.Section title={t('settings.pro_features.title')}>
        <List.Item
          onPress={() => push('/(tabs)/settings/ai/planner')}
          title={t('ai.planner.title')}
          description={t('ai.planner.subtitle')}
          left={(props) => <List.Icon icon={'bolt'} {...props} />}
        ></List.Item>
      </List.Section>

      <List.Section title={t('settings.support.title')}>
        <List.Item
          onPress={() =>
            openUrl(
              'https://github.com/LiamMorrow/LiftLog/issues/new?assignees=&labels=enhancement&projects=&template=feature_request.md',
            )
          }
          title={t('settings.feature_request.title')}
          description={t('settings.feature_request.subtitle')}
          left={(props) => <List.Icon icon={'star'} {...props} />}
        ></List.Item>

        <List.Item
          onPress={() => openUrl(bugReportUrl)}
          title={t('settings.bug_report.title')}
          description={t('settings.bug_report.subtitle')}
          left={(props) => <List.Icon icon={'bugReport'} {...props} />}
        ></List.Item>

        <List.Item
          onPress={() =>
            openUrl(
              'https://github.com/LiamMorrow/LiftLog/issues/new?assignees=&labels=translation&projects=&template=translation-suggestion.md',
            )
          }
          title={t('settings.translation.title')}
          description={t('settings.translation.subtitle')}
          left={(props) => <List.Icon icon={'translate'} {...props} />}
        ></List.Item>
        <List.Item
          onPress={() => setAppInfoOpen(true)}
          title={t('settings.app_info.title')}
          description={t('settings.app_info.subtitle')}
          left={(props) => <List.Icon icon={'info'} {...props} />}
        ></List.Item>
      </List.Section>

      <Portal>
        <Dialog visible={appInfoOpen} onDismiss={() => setAppInfoOpen(false)}>
          <Dialog.Title>
            <T keyName="settings.app_info.title" />
          </Dialog.Title>
          <Dialog.Content>
            <Text>
              LiftLog is an entirely open source app, licensed under the
              AGPL-3.0 license. You can find the source code on{' '}
              <Link
                style={{ color: colors.primary, fontWeight: 'bold' }}
                href="https://github.com/LiamMorrow/LiftLog"
              >
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
    </FullHeightScrollView>
  );
}
