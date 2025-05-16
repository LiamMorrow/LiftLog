import CardList from '@/components/presentation/card-list';
import EmptyInfo from '@/components/presentation/empty-info';
import FloatingBottomContainer from '@/components/presentation/floating-bottom-container';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import LimitedHtml from '@/components/presentation/limited-html';
import ManageWorkoutCardContent from '@/components/smart/manage-workout-card-content';
import { spacing } from '@/hooks/useAppTheme';
import { SessionBlueprint } from '@/models/session-models';
import { useAppSelectorWithArg } from '@/store';
import { selectProgram, setSavedPlanName } from '@/store/program';
import { setEditingSession } from '@/store/session-editor';
import { useTranslate } from '@tolgee/react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FAB, TextInput } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { msIconSource } from '@/components/presentation/ms-icon-source';

export default function ManageWorkouts() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const { push } = useRouter();
  const program = useAppSelectorWithArg(selectProgram, programId);
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const addWorkout = () => {
    // TODO
  };
  const selectSession = (sessionBlueprint: SessionBlueprint, index: number) => {
    dispatch(setEditingSession(sessionBlueprint));
    push(`/settings/manage-workouts/${programId}/manage-session/${index}`);
  };

  const floatingBottomContainer = (
    <FloatingBottomContainer
      fab={
        <FAB
          variant="surface"
          size="small"
          icon={msIconSource('add')}
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
        renderItem={(session) => (
          <ManageWorkoutCardContent
            sessionBlueprint={session}
            programId={programId}
          />
        )}
      />
    </FullHeightScrollView>
  );
}
