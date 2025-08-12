import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';

import { useAppTheme } from '@/hooks/useAppTheme';
import { T, useTranslate } from '@tolgee/react';
import { Link, Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Text } from 'react-native';
import { Button, Dialog, Icon, List, Portal } from 'react-native-paper';

export default function Settings() {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const { push } = useRouter();
  const [appInfoOpen, setAppInfoOpen] = useState(false);

  const openUrl = (url: string) => {
    void Linking.canOpenURL(url).then(() => Linking.openURL(url));
  };

  return (
    <FullHeightScrollView>
      <Stack.Screen options={{ title: t('Settings') }} />
      <List.Section title={t('Configuration')}>
        <List.Item
          onPress={() => push('/(tabs)/settings/program-list')}
          title={t('ManagePlans')}
          description={t('ManagePlansSubtitle')}
          left={(props) => <List.Icon icon={'assignment'} {...props} />}
        ></List.Item>
        <List.Item
          onPress={() => push('/(tabs)/settings/manage-exercises')}
          title={t('Manage exercises')}
          description={t('Manage your exercise list')}
          left={(props) => <List.Icon icon={'directionsRun'} {...props} />}
        ></List.Item>
        <List.Item
          onPress={() => push('/(tabs)/settings/app-configuration')}
          title={t('AppConfiguration')}
          description={t('AppConfigurationSubtitle')}
          left={(props) => <List.Icon icon={'settings'} {...props} />}
        ></List.Item>

        <List.Item
          onPress={() => push('/(tabs)/settings/notifications')}
          title={t('Notifications')}
          description={t('NotificationsSubtitle')}
          left={(props) => <List.Icon icon={'notifications'} {...props} />}
        ></List.Item>

        <List.Item
          onPress={() => push('/(tabs)/settings/backup-and-restore')}
          title={t('ExportBackupRestore')}
          description={t('ExportBackupRestoreSubtitle')}
          left={(props) => (
            <List.Icon icon={'settingsBackupRestore'} {...props} />
          )}
        ></List.Item>
      </List.Section>

      <List.Section title={t('ProFeatures')}>
        <List.Item
          onPress={() => push('/(tabs)/settings/ai/planner')}
          title={t('AiPlanner')}
          description={t('AiPlannerSubtitle')}
          left={(props) => <List.Icon icon={'bolt'} {...props} />}
        ></List.Item>
      </List.Section>

      <List.Section title={t('Support')}>
        <List.Item
          onPress={() =>
            openUrl(
              'https://github.com/LiamMorrow/LiftLog/issues/new?assignees=&labels=enhancement&projects=&template=feature_request.md',
            )
          }
          title={t('FeatureRequest')}
          description={t('FeatureRequestSubtitle')}
          left={(props) => <List.Icon icon={'star'} {...props} />}
        ></List.Item>

        <List.Item
          onPress={() =>
            openUrl(
              'https://github.com/LiamMorrow/LiftLog/issues/new?assignees=&labels=bug&projects=&template=bug_report.md',
            )
          }
          title={t('BugReport')}
          description={t('BugReportSubtitle')}
          left={(props) => <List.Icon icon={'bugReport'} {...props} />}
        ></List.Item>

        <List.Item
          onPress={() =>
            openUrl(
              'https://github.com/LiamMorrow/LiftLog/issues/new?assignees=&labels=translation&projects=&template=translation-suggestion.md',
            )
          }
          title={t('Translation')}
          description={t('TranslationSubtitle')}
          left={(props) => <List.Icon icon={'translate'} {...props} />}
        ></List.Item>
        <List.Item
          onPress={() => setAppInfoOpen(true)}
          title={t('AppInfo')}
          description={t('AppInfoSubtitle')}
          left={(props) => <List.Icon icon={'info'} {...props} />}
        ></List.Item>
      </List.Section>

      <Portal>
        <Dialog visible={appInfoOpen} onDismiss={() => setAppInfoOpen(false)}>
          <Dialog.Title>
            <T keyName="AppInfo" />
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: colors.onSurface }}>
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
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAppInfoOpen(false)}>
              <T keyName="Close" />
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </FullHeightScrollView>
  );
}
