import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import ListSwitch from '@/components/presentation/list-switch';
import { RootState, useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  broadcastWorkoutEvent,
  selectCurrentSession,
} from '@/store/current-session';
import {
  getCardioTimerInfo,
  getTimerInfo,
} from '@/store/current-session/helpers';
import { setRestNotifications } from '@/store/settings';
import { T, useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { List } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function AppConfiguration() {
  const { t } = useTranslate();
  const settings = useAppSelector((state: RootState) => state.settings);
  const currentWorkout = useAppSelectorWithArg(
    selectCurrentSession,
    'workoutSession',
  );
  const lastSetTime = useAppSelector(
    (x) => x.currentSession.workoutSessionLastSetTime,
  );
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
              dispatch(
                broadcastWorkoutEvent({
                  type: 'WorkoutUpdatedEvent',
                  workout: currentWorkout,
                  restTimerInfo: getTimerInfo(currentWorkout, lastSetTime),
                  cardioTimerInfo: getCardioTimerInfo(currentWorkout),
                }),
              );
            }
          }}
        />
      </List.Section>
    </FullHeightScrollView>
  );
}
