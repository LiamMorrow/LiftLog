import SessionComponent from '@/components/smart/session-component';
import SessionMoreMenuComponent from '@/components/smart/session-more-menu-component';
import { spacing } from '@/hooks/useAppTheme';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { selectSession, sessionFinished, updateStoredSession } from '@/store/stored-sessions';
import { useFinishWorkout } from '@/hooks/useFinishWorkout';
import { LocalDate } from '@js-joda/core';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { View } from 'react-native';
import { DatePickerInput } from 'react-native-paper-dates';
import { useDispatch } from 'react-redux';
import { useOnDismiss } from '@/hooks/useOnDismiss';
import { useStartWorkoutWithConfirmation } from '@/hooks/useStartWorkoutWithConfirmation';
import { useTranslate } from '@tolgee/react';
import { useRef } from 'react';

export default function HistoryEditPage() {
  const dispatch = useDispatch();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const session = useAppSelectorWithArg(selectSession, sessionId);
  const { dismissTo, push } = useRouter();
  const finishWorkout = useFinishWorkout(sessionId);

  // Resuming hands the session back to the workout in progress, so leaving this screen must not also
  // finish it - that would immediately clear it as the active workout again.
  const resumed = useRef(false);
  useOnDismiss(() => {
    if (!resumed.current) {
      dispatch(sessionFinished(sessionId));
    }
  });
  const { start: resume, confirmationDialog } = useStartWorkoutWithConfirmation({
    onStarted: () => {
      resumed.current = true;
      dismissTo('/history');
    },
  });

  const save = () => {
    const hasDiff = finishWorkout();
    dismissTo('/history');
    if (hasDiff) {
      push('/diff-save');
    }
  };
  const showBodyweight = useAppSelector((x) => x.settings.showBodyweight);
  const { t } = useTranslate();

  // The row is gone if it was deleted from under this screen.
  if (!session) {
    return null;
  }

  const jsDate = new Date(session.date.year(), session.date.month().ordinal(), session.date.dayOfMonth());

  return (
    <>
      <Stack.Screen
        options={{
          title: session.blueprint.name,
        }}
      />
      <SessionMoreMenuComponent
        session={session}
        save={save}
        additionalItems={[
          {
            label: t('workout.resume.button'),
            icon: 'playCircle',
            systemImage: 'play.circle',
            onPress: () => resume(session),
          },
        ]}
      />
      {confirmationDialog}
      <SessionComponent
        session={session}
        updateSession={(update) => dispatch(updateStoredSession({ sessionId, update }))}
        showBodyweight={showBodyweight}
        header={
          <View style={{ paddingHorizontal: spacing.pageHorizontalMargin }}>
            <DatePickerInput
              testID="session-date-input"
              locale="default"
              inputMode="start"
              onChange={(e) => {
                if (e)
                  dispatch(
                    updateStoredSession({
                      sessionId,
                      update: (s) => s.withUpdatedDate(LocalDate.of(e.getFullYear(), e.getMonth() + 1, e.getDate())),
                    }),
                  );
              }}
              value={jsDate}
            />
          </View>
        }
      />
    </>
  );
}
