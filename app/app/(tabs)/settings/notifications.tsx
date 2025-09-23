import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import ListSwitch from '@/components/presentation/list-switch';
import AndroidNotificationAlert from '@/components/smart/android-notification-alert';
import { RootState, useAppSelector } from '@/store';
import { requestExactNotificationPermission } from '@/store/app';
import { setRestNotifications } from '@/store/settings';
import { T, useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { List } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function AppConfiguration() {
  const { t } = useTranslate();
  const settings = useAppSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  return (
    <FullHeightScrollView>
      <Stack.Screen options={{ title: t('Notifications') }} />
      <List.Section>
        <ListSwitch
          headline={<T keyName="RestNotifications" />}
          supportingText={<T keyName="RestNotificationsSubtitle" />}
          value={settings.restNotifications}
          onValueChange={(value) => dispatch(setRestNotifications(value))}
        />
        <List.Item
          title={t('Request exact notification permission')}
          onPress={() => dispatch(requestExactNotificationPermission(true))}
        />
      </List.Section>
      <AndroidNotificationAlert />
    </FullHeightScrollView>
  );
}
