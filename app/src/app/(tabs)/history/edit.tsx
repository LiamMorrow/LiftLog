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

export default function HistoryEditPage() {
  const dispatch = useDispatch();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const session = useAppSelectorWithArg(selectSession, sessionId);
  const { dismissTo, push } = useRouter();
  const finishWorkout = useFinishWorkout(sessionId);

  useOnDismiss(() => dispatch(sessionFinished(sessionId)));

  const save = () => {
    const hasDiff = finishWorkout();
    dismissTo('/history');
    if (hasDiff) {
      push('/diff-save');
    }
  };
  const showBodyweight = useAppSelector((x) => x.settings.showBodyweight);

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
      <SessionMoreMenuComponent session={session} save={save} />
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
