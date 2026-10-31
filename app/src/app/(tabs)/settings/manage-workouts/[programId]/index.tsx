import CardList from '@/components/presentation/foundation/card-list';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import LimitedHtml from '@/components/presentation/foundation/limited-html';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import AddIcon from '@expo/material-symbols/add.xml';
import AccessibilityNew from '@expo/material-symbols/accessibility_new.xml';
import ManageWorkoutCardContent from '@/components/smart/manage-workout-card-content';
import { getMuscleAnalysisHref } from '@/components/smart/muscle-analysis';
import { spacing } from '@/hooks/useAppTheme';
import { EmptySession } from '@/models/session-models';
import { useAppSelectorWithArg } from '@/store';
import { addProgramSession, selectProgram, setSavedPlanName } from '@/store/program';
import { useTranslate } from '@tolgee/react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { Card, TextInput } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function ManageWorkouts() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const { push } = useRouter();
  const program = useAppSelectorWithArg(selectProgram, programId);
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const selectSession = (index: number) => {
    push(`/plan-workout-editor/${programId}/${index}`);
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
    );
    selectSession(program.sessions.length);
  };
  const floatingBottomContainer = (
    <PageActions
      primary={{
        label: t('workout.add.button'),
        icon: AddIcon,
        systemImage: 'plus',
        onPress: addWorkout,
      }}
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
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          hidden={!program.sessions.length}
          accessibilityLabel={t('plan.muscle_analysis.title')}
          onPress={() => push(getMuscleAnalysisHref(programId))}
        >
          <Stack.Toolbar.Icon sf="figure.arms.open" {...(Platform.OS === 'ios' ? {} : { src: AccessibilityNew })} />
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <TextInput
        value={program.name}
        style={{ marginBottom: spacing[2] }}
        mode="flat"
        onChangeText={(name) => dispatch(setSavedPlanName({ programId: programId, name }))}
      />
      {emptyInfo}

      <CardList
        items={program.sessions}
        cardType="contained"
        onPress={(_, i) => selectSession(i)}
        renderItemContent={(session) => (
          <Card.Content>
            <ManageWorkoutCardContent sessionBlueprint={session} programId={programId} />
          </Card.Content>
        )}
      />
    </FullHeightScrollView>
  );
}
