import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import ListTitle from '@/components/presentation/list-title';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { List } from 'react-native-paper';

export default function Settings() {
  const { t } = useTranslate();
  const { colors, font } = useAppTheme();
  const { push } = useRouter();
  return (
    <FullHeightScrollView>
      <Stack.Screen options={{ title: t('Settings') }} />
      <List.Section>
        <ListTitle title={t('Configuration')} />
        <List.Item
          onPress={() => push('/(tabs)/settings/program-list')}
          title={t('ManagePlans')}
          description={t('ManagePlansSubtitle')}
          left={(props) => <List.Icon icon={'assignment'} {...props} />}
        ></List.Item>
        <List.Item
          onPress={() => push('/(tabs)/settings/app-configuration')}
          title={t('AppConfiguration')}
          description={t('AppConfigurationSubtitle')}
          left={(props) => <List.Icon icon={'settings'} {...props} />}
        ></List.Item>
      </List.Section>
    </FullHeightScrollView>
  );
}
