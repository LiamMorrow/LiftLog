import CardList from '@/components/presentation/card-list';
import EmptyInfo from '@/components/presentation/empty-info';
import FloatingBottomContainer from '@/components/presentation/floating-bottom-container';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import LimitedHtml from '@/components/presentation/limited-html';
import ManageWorkoutCardContent from '@/components/smart/manage-workout-card-content';
import { spacing } from '@/hooks/useAppTheme';
import { SessionBlueprint } from '@/models/blueprint-models';
import { EmptySession } from '@/models/session-models';
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
      name: `${t('workout.workout.label')} ${program.sessions.length + 1}`,
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
          label={t('workout.add.button')}
          onPress={addWorkout}
        />
      }
    />
  );
  const emptyInfo = program.sessions.length ? undefined : (
    <EmptyInfo>
      <LimitedHtml value={t('workout.no_workouts_in_plan.message')} />
    </EmptyInfo>
  );
  return (
    <FullHeightScrollView
      floatingChildren={floatingBottomContainer}
      scrollStyle={{
        paddingHorizontal: spacing.pageHorizontalMargin,
      }}
    >
      <Stack.Screen options={{ title: program.name }} />
      <TextInput
        value={program.name}
        style={{ marginBottom: spacing[2] }}
        mode="flat"
        onChangeText={(name) =>
          dispatch(setSavedPlanName({ programId: programId, name }))
        }
      />
      {emptyInfo}

      <CardList
        items={program.sessions}
        cardType="contained"
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
