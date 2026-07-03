import SessionComponent from '@/components/smart/session-component';
import SessionMoreMenuComponent from '@/components/smart/session-more-menu-component';
import { spacing } from '@/hooks/useAppTheme';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { selectCurrentSession, setCurrentSession } from '@/store/current-session';
import { useFinishWorkout } from '@/hooks/useFinishWorkout';
import { LocalDate } from '@js-joda/core';
import { useRouter, Stack } from 'expo-router';
import { View } from 'react-native';
import { DatePickerInput } from 'react-native-paper-dates';
import { useDispatch } from 'react-redux';

export default function HistoryEditPage() {
  const dispatch = useDispatch();
  const session = useAppSelectorWithArg(selectCurrentSession, 'historySession');
  const { dismissTo } = useRouter();
  const finishWorkout = useFinishWorkout('historySession');

  const save = () => {
    const hasDiff = finishWorkout();

    if (hasDiff) {
      dismissTo('/history/diff-save', { withAnchor: true });
    } else {
      dismissTo('/history');
    }
  };
  const showBodyweight = useAppSelector((x) => x.settings.showBodyweight);
  const jsDate = session && new Date(session.date.year(), session.date.month().ordinal(), session.date.dayOfMonth());

  return (
    <>
      <Stack.Screen
        options={{
          title: session?.blueprint.name ?? 'Workout',
        }}
      />
      <SessionMoreMenuComponent target="historySession" save={save} />
      <SessionComponent
        target="historySession"
        showBodyweight={showBodyweight}
        header={
          <View style={{ paddingHorizontal: spacing.pageHorizontalMargin }}>
            <DatePickerInput
              testID="session-date-input"
              locale="default"
              inputMode="start"
              onChange={(e) => {
                if (e && session)
                  dispatch(
                    setCurrentSession({
                      target: 'historySession',
                      session: session.withUpdatedDate(LocalDate.of(e.getFullYear(), e.getMonth() + 1, e.getDate())),
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
