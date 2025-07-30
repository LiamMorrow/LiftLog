import SessionComponent from '@/components/smart/session-component';
import SessionMoreMenuComponent from '@/components/smart/session-more-menu-component';
import { spacing } from '@/hooks/useAppTheme';
import { useAppSelector, RootState } from '@/store';
import {
  persistCurrentSession,
  setActiveSessionDate,
} from '@/store/current-session';
import { addUnpublishedSessionId } from '@/store/feed';
import { setStatsIsDirty } from '@/store/stats';
import { LocalDate } from '@js-joda/core';
import { useRouter, Stack } from 'expo-router';
import { View } from 'react-native';
import { DatePickerInput } from 'react-native-paper-dates';
import { useDispatch } from 'react-redux';

export default function HistoryEditPage() {
  const dispatch = useDispatch();
  const session = useAppSelector(
    (state: RootState) => state.currentSession.historySession,
  );
  const { dismissTo } = useRouter();

  const save = () => {
    console.log('SAVE');
    dispatch(persistCurrentSession('historySession'));
    if (session) {
      dispatch(addUnpublishedSessionId(session.id));
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
        saveAndClose={save}
      />
    </>
  );
}
