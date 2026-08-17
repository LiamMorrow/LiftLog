import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import ListSwitch from '@/components/presentation/foundation/list-switch';
import { RootState, useAppSelector } from '@/store';
import { broadcastWorkoutEvent } from '@/store/workout-worker';
import { workoutUpdatedEvent } from '@/store/workout-worker/helpers';
import { selectActiveSession } from '@/store/stored-sessions';
import { setRestNotifications, setRestTimersEnabled } from '@/store/settings';
import { T, useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { List } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function AppConfiguration() {
  const { t } = useTranslate();
  const settings = useAppSelector((state: RootState) => state.settings);
  const currentWorkout = useAppSelector(selectActiveSession);
  const dispatch = useDispatch();

  return (
    <FullHeightScrollView>
      <Stack.Screen options={{ title: t('settings.notifications.title') }} />
      <List.Section>
        <ListSwitch
          headline={<T keyName="rest.notifications.title" />}
          supportingText={<T keyName="rest.notifications.subtitle" />}
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
        <ListSwitch
          testID="setRestTimersEnabled"
          headline={<T keyName="workout.rest_timers.label" />}
          supportingText={<T keyName="workout.rest_timers.subtitle" />}
          value={settings.restTimersEnabled}
          onValueChange={(value) => dispatch(setRestTimersEnabled(value))}
        />
      </List.Section>
    </FullHeightScrollView>
  );
}
