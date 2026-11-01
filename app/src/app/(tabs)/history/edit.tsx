import SessionComponent from '@/components/smart/session-component';
import SessionMoreMenuComponent from '@/components/smart/session-more-menu-component';
import { spacing } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { sessionFinished, updateStoredSession } from '@/store/stored-sessions';
import { useSession } from '@/hooks/useSession';
import { useFinishWorkout } from '@/hooks/useFinishWorkout';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useOnDismiss } from '@/hooks/useOnDismiss';
import { useStartWorkoutWithConfirmation } from '@/hooks/useStartWorkoutWithConfirmation';
import { useTranslate } from '@tolgee/react';
import { useRef } from 'react';
import PlayCircle from '@expo/material-symbols/play_circle.xml';
import CalendarMonthIcon from '@expo/material-symbols/calendar_month.xml';
import { DatePicker } from '@/components/presentation/foundation/date-picker';
import { SegmentedGroup, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';

export default function HistoryEditPage() {
  const dispatch = useDispatch();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const session = useSession(sessionId);
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
  const { start: resume } = useStartWorkoutWithConfirmation({
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
            icon: PlayCircle,
            systemImage: 'play.circle',
            onPress: () => resume(session),
          },
        ]}
      />
      <SessionComponent
        session={session}
        updateSession={(update) => dispatch(updateStoredSession({ sessionId, update }))}
        showBodyweight={showBodyweight}
        header={
          <View style={{ paddingHorizontal: spacing.pageHorizontalMargin }}>
            <SegmentedGroup>
              <SegmentListFormElement
                icon={CalendarMonthIcon}
                systemImage="calendar"
                label={t('generic.date.label')}
                right={
                  <DatePicker
                    testID="session-date-input"
                    value={session.date}
                    onChange={(date) =>
                      dispatch(updateStoredSession({ sessionId, update: (s) => s.withUpdatedDate(date) }))
                    }
                  />
                }
              />
            </SegmentedGroup>
          </View>
        }
      />
    </>
  );
}
