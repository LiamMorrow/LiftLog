import SessionComponent from '@/components/smart/session-component';
import { spacing } from '@/hooks/useAppTheme';
import { useAppSelector, RootState } from '@/store';
import {
  persistCurrentSession,
  setActiveSessionDate,
} from '@/store/current-session';
import { setStatsIsDirty } from '@/store/stats';
import { LocalDate } from '@js-joda/core';
import { useRouter, Stack } from 'expo-router';
import { View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { DatePickerInput } from 'react-native-paper-dates';
import { useDispatch } from 'react-redux';

export default function HistoryEditPage() {
  const dispatch = useDispatch();
  const session = useAppSelector(
    (state: RootState) => state.currentSession.historySession,
  );
  const { dismissTo } = useRouter();

  const save = () => {
    dispatch(persistCurrentSession('historySession'));
    // TODO
    if (session) {
      // dispatch(addUnpublishedSessionIdAction(session.id));
    }
    dispatch(setStatsIsDirty(true));
    dismissTo('/history');
  };
  const showBodyweight = useAppSelector((x) => x.settings.showBodyweight);
  const jsDate =
    session &&
    new Date(
      session.date.year(),
      session.date.month().ordinal(),
      session.date.dayOfMonth(),
    );

  return (
    <>
      <Stack.Screen
        options={{
          title: session?.blueprint.name ?? 'Workout',
          headerRight: () => (
            <Appbar.Action icon={'save'} onPress={save}></Appbar.Action>
          ),
        }}
      />
      <View
        style={{
          paddingHorizontal: spacing[8],
          marginVertical: spacing[2],
          flexDirection: 'row',
        }}
      >
        <DatePickerInput
          locale="default"
          inputMode="start"
          onChange={(e) => {
            if (e)
              dispatch(
                setActiveSessionDate({
                  target: 'historySession',
                  payload: LocalDate.of(
                    e.getFullYear(),
                    e.getMonth() + 1,
                    e.getDate(),
                  ),
                }),
              );
          }}
          value={jsDate}
        />
      </View>
      <SessionComponent
        target="historySession"
        showBodyweight={showBodyweight}
      />
    </>
  );
}
