import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import { useAppSelector } from '@/store';
import { requestExactNotificationPermission } from '@/store/app';
import { setRestNotifications } from '@/store/settings';
import { T, useTranslate } from '@tolgee/react';
import { Platform } from 'react-native';
import { useDispatch } from 'react-redux';

function AndroidNotificationAlertImpl() {
  const dispatch = useDispatch();
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
      okText={t('GrantPermission', 'Grant')}
      onOk={() => dispatch(requestExactNotificationPermission())}
      cancelText={t('DisableNotifications', 'Disable Notifications')}
      onCancel={() => dispatch(setRestNotifications(false))}
      preventCancel={true}
      headline={<T keyName="EnableNotificationsQuestion" />}
      textContent={<T keyName="AndroidNotificationPermissionExplanation" />}
    />
  );
}

export default function AndroidNotificationAlert() {
  if (Platform.OS !== 'android') {
    return <></>;
  }
  return <AndroidNotificationAlertImpl />;
}
