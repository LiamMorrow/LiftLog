import SessionComponent from '@/components/smart/session-component';
import SessionMoreMenuComponent from '@/components/smart/session-more-menu-component';
import { spacing } from '@/hooks/useAppTheme';
import { LocalDate } from '@js-joda/core';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { DatePickerInput } from 'react-native-paper-dates';
import { useDispatch } from 'react-redux';
import { useAppSelector, RootState } from '@/store';
import {
  finishCurrentWorkout,
  setActiveSessionDate,
} from '@/store/current-session';

export function HistoryEditContent(props: {
  emptyRoute: '/history' | '/(tabs)/progress';
}) {
  const dispatch = useDispatch();
  const session = useAppSelector(
    (state: RootState) => state.currentSession.historySession,
  );
  const { dismissTo } = useRouter();

  useEffect(() => {
    if (!session) {
      dismissTo(props.emptyRoute);
    }
  }, [dismissTo, props.emptyRoute, session]);

  const save = () => {
    dispatch(finishCurrentWorkout('historySession'));
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
            <SessionMoreMenuComponent target="historySession" />
          ),
        }}
      />
      <View
        style={{
          paddingHorizontal: spacing.pageHorizontalMargin,
          flexDirection: 'row',
        }}
      >
        <DatePickerInput
          testID="session-date-input"
          locale="default"
          inputMode="start"
          onChange={(value) => {
            if (value) {
              dispatch(
                setActiveSessionDate({
                  target: 'historySession',
                  payload: LocalDate.of(
                    value.getFullYear(),
                    value.getMonth() + 1,
                    value.getDate(),
                  ),
                }),
              );
            }
          }}
          value={jsDate}
        />
      </View>
      <SessionComponent
        target="historySession"
        showBodyweight={showBodyweight}
        saveAndClose={save}
      />
    </>
  );
}
