import { RootState, useAppSelector } from '@/store';
import { broadcastWorkoutEvent } from '@/store/workout-worker';
import { workoutUpdatedEvent } from '@/store/workout-worker/helpers';
import { selectActiveSession } from '@/store/stored-sessions';
import { setRestNotifications, setRestTimersEnabled } from '@/store/settings';
import { useTranslate } from '@tolgee/react';
import { useDispatch } from 'react-redux';
import { SettingsPage } from '@/components/layout/settings-page';
import { SegmentedListSwitch } from '@/components/presentation/foundation/segmented-list-switch';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';

export default function NotificationsPage() {
  const { t } = useTranslate();
  const settings = useAppSelector((state: RootState) => state.settings);
  const currentWorkout = useAppSelector(selectActiveSession);
  const dispatch = useDispatch();
  return (
    <SettingsPage title={t('settings.notifications.title')} caption={t('settings.notifications.subtitle')}>
      <SegmentedGroup>
        <SegmentedListSwitch
          label={t('rest.notifications.title')}
          icon={'notifications'}
          supportingText={t('rest.notifications.subtitle')}
          value={settings.restNotifications}
          onValueChange={(value) => {
            dispatch(setRestNotifications(value));
            if (currentWorkout) {
              dispatch(
                broadcastWorkoutEvent({
                  type: value ? 'WorkoutStartedEvent' : 'WorkoutEndedEvent',
                }),
              );
              dispatch(broadcastWorkoutEvent(workoutUpdatedEvent(currentWorkout, settings.restTimersEnabled)));
            }
          }}
        />
        <SegmentedListSwitch
          testID="setRestTimersEnabled"
          label={t('workout.rest_timers.label')}
          icon={'timer'}
          supportingText={t('workout.rest_timers.subtitle')}
          value={settings.restTimersEnabled}
          onValueChange={(value) => dispatch(setRestTimersEnabled(value))}
        />
      </SegmentedGroup>
    </SettingsPage>
  );
}
