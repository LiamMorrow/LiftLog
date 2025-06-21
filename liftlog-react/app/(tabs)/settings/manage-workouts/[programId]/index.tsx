import CardList from '@/components/presentation/card-list';
import EmptyInfo from '@/components/presentation/empty-info';
import FloatingBottomContainer from '@/components/presentation/floating-bottom-container';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import LimitedHtml from '@/components/presentation/limited-html';
import ManageWorkoutCardContent from '@/components/smart/manage-workout-card-content';
import { spacing } from '@/hooks/useAppTheme';
import { EmptySession, SessionBlueprint } from '@/models/session-models';
import { useAppSelectorWithArg } from '@/store';
import {
  addProgramSession,
  selectProgram,
  setSavedPlanName,
} from '@/store/program';
import { setEditingSession } from '@/store/session-editor';
import { useTranslate } from '@tolgee/react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Card, FAB, TextInput } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function ManageWorkouts() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const { push } = useRouter();
  const program = useAppSelectorWithArg(selectProgram, programId);
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const selectSession = (sessionBlueprint: SessionBlueprint, index: number) => {
    dispatch(setEditingSession(sessionBlueprint));
    push(`/settings/manage-workouts/${programId}/manage-session/${index}`);
  };

  const addWorkout = () => {
    const newSession = EmptySession.blueprint.with({
      name: `${t('Workout')} ${program.sessions.length + 1}`,
    });
    dispatch(
      addProgramSession({
        programId,
        sessionBlueprint: newSession,
      }),
      selectSession(newSession, program.sessions.length),
    );
  };
  const floatingBottomContainer = (
    <FloatingBottomContainer
      fab={
        <FAB
          variant="surface"
          size="small"
          icon={'add'}
          label={t('AddWorkout')}
          onPress={addWorkout}
        />
      }
    />
  );
  const emptyInfo = program.sessions.length ? undefined : (
    <EmptyInfo>
      <LimitedHtml value={t('NoWorkoutsInPlan')} />
    </EmptyInfo>
  );
  return (
    <FullHeightScrollView floatingChildren={floatingBottomContainer}>
      <Stack.Screen options={{ title: program.name }} />
      <TextInput
        style={{ marginHorizontal: spacing[2] }}
        value={program.name}
        mode="flat"
        onChangeText={(name) =>
          dispatch(setSavedPlanName({ programId: programId, name }))
        }
      />
      {emptyInfo}

      <CardList
        items={program.sessions}
        cardType="outlined"
        onPress={selectSession}
        renderItemContent={(session) => (
          <Card.Content>
            <ManageWorkoutCardContent
              sessionBlueprint={session}
              programId={programId}
            />
          </Card.Content>
        )}
      />
    </FullHeightScrollView>
  );
}
