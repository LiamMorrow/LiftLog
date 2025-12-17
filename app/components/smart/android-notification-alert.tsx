import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import { useAppSelector } from '@/store';
import {
  refreshNotificationPermissionStatus,
  requestExactNotificationPermission,
} from '@/store/app';
import { setRestNotifications } from '@/store/settings';
import { T, useTranslate } from '@tolgee/react';
import { useFocusEffect } from 'expo-router';
import { Platform } from 'react-native';
import { useDispatch } from 'react-redux';

function AndroidNotificationAlertImpl() {
  const dispatch = useDispatch();

  useFocusEffect(() => {
    dispatch(refreshNotificationPermissionStatus());
  });

  const canScheduleExactNotifications = useAppSelector(
    (x) => x.app.canScheduleExactNotifications,
  );
  const restNotificationsEnabled = useAppSelector(
    (x) => x.settings.restNotifications,
  );
  const isOpen = !canScheduleExactNotifications && restNotificationsEnabled;
  const { t } = useTranslate();
  return (
    <ConfirmationDialog
      open={isOpen}
      okText={t('generic.grant_permission.button', 'Grant')}
      onOk={() => dispatch(requestExactNotificationPermission())}
      cancelText={t(
        'permissions.disable_notifications.button',
        'Disable Notifications',
      )}
      onCancel={() => dispatch(setRestNotifications(false))}
      preventCancel={true}
      headline={<T keyName="permissions.enable_notifications.confirm.title" />}
      textContent={
        <T keyName="permissions.notifications.android.explanation" />
      }
    />
  );
}

export default function AndroidNotificationAlert() {
  if (Platform.OS !== 'android') {
    return <></>;
  }
  return <AndroidNotificationAlertImpl />;
}
