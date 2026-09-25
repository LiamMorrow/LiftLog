import { RootState, useAppSelector } from '@/store';
import { broadcastWorkoutEvent } from '@/store/workout-worker';
import { workoutUpdatedEvent } from '@/store/workout-worker/helpers';
import { selectActiveSession } from '@/store/stored-sessions';
import { setRestCountdownTones, setRestNotifications, setRestTimersEnabled } from '@/store/settings';
import { useTranslate } from '@tolgee/react';
import { useDispatch } from 'react-redux';
import { SettingsPage } from '@/components/layout/settings-page';
import { SegmentedListSwitch } from '@/components/presentation/foundation/segmented-list-switch';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import { spacing } from '@/hooks/useAppTheme';
import { Platform } from 'react-native';

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
        {Platform.OS === 'android' ? (
          <SegmentedListSwitch
            testID="setRestCountdownTones"
            label={t('rest.notifications.countdown_tones.title')}
            icon="volumeUp"
            supportingText={t('rest.notifications.countdown_tones.subtitle')}
            value={settings.restCountdownTones}
            disabled={!settings.restNotifications}
            style={{
              paddingInlineStart: spacing[8],
              opacity: settings.restNotifications ? 1 : 0.5,
            }}
            onValueChange={(value) => {
              dispatch(setRestCountdownTones(value));
              if (currentWorkout) {
                dispatch(broadcastWorkoutEvent(workoutUpdatedEvent(currentWorkout, settings.restTimersEnabled)));
              }
            }}
          />
        ) : undefined}
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
