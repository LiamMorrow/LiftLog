import AccessibilityNewIcon from '@expo/material-symbols/accessibility_new.xml';
import ShareIcon from '@expo/material-symbols/share.xml';
import { SettingsPage } from '@/components/layout/settings-page';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import LimitedHtml from '@/components/presentation/foundation/limited-html';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import { TitledSection } from '@/components/presentation/foundation/titled-section';
import {
  SegmentedGroup,
  SegmentedListItem,
  SegmentListFormElement,
} from '@/components/presentation/foundation/segmented-list';
import { SegmentedListLink } from '@/components/presentation/foundation/segmented-list-link';
import { SegmentedListTextInput } from '@/components/presentation/foundation/segmented-list-text-input';
import { getMuscleAnalysisHref } from '@/components/smart/muscle-analysis';
import { PlanWorkoutRow } from '@/components/smart/plan-workout-row';
import { useReorderToolbarItem } from '@/components/smart/reorder-toolbar-item';
import { spacing } from '@/hooks/useAppTheme';
import { SharedProgramBlueprint } from '@/models/feed-models';
import { EmptySession } from '@/models/session-models';
import { useAppSelectorWithArg } from '@/store';
import { encryptAndShare } from '@/store/feed';
import { addProgramSession, selectProgram, setSavedPlanName } from '@/store/program';
import AddIcon from '@expo/material-symbols/add.xml';
import { useTranslate } from '@tolgee/react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';

export default function ManageWorkouts() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const { push } = useRouter();
  const program = useAppSelectorWithArg(selectProgram, programId);
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const [reordering, setReordering] = useState(false);
  const reorderToolbarItem = useReorderToolbarItem({
    reordering,
    onToggle: () => setReordering(!reordering),
    hidden: program.sessions.length < 2,
  });

  const selectSession = (index: number) => {
    push(`/plan-workout-editor/${programId}/${index}`);
  };

  const addWorkout = () => {
    const newSession = EmptySession.blueprint.with({
      name: `${t('workout.workout.label')} ${program.sessions.length + 1}`,
    });
    dispatch(addProgramSession({ programId, sessionBlueprint: newSession }));
    selectSession(program.sessions.length);
  };

  const days = program.sessions.length;
  const exercises = program.sessions.reduce((total, session) => total + session.exercises.length, 0);
  const summary = [
    t(days === 1 ? 'plan.summary.day' : 'plan.summary.days', { count: days }),
    t(exercises === 1 ? 'plan.summary.exercise' : 'plan.summary.exercises', { count: exercises }),
  ].join(' · ');

  const actions = reordering ? undefined : (
    <PageActions
      primary={{
        label: t('workout.add.button'),
        icon: AddIcon,
        systemImage: 'plus',
        onPress: addWorkout,
      }}
    />
  );

  return (
    <SettingsPage title={program.name} actions={actions}>
      <Stack.Toolbar placement="right">{reorderToolbarItem}</Stack.Toolbar>
      <SegmentedGroup>
        <SegmentedListTextInput
          label={t('generic.name.label')}
          value={program.name}
          onChangeText={(name) => dispatch(setSavedPlanName({ programId, name }))}
        />
      </SegmentedGroup>

      <TitledSection title={t('plan.workouts.title')} trailing={days ? summary : undefined}>
        {days ? (
          <SegmentedGroup>
            {program.sessions.map((session, index) => (
              <PlanWorkoutRow
                key={index}
                programId={programId}
                sessionBlueprint={session}
                sessionIndex={index}
                reordering={reordering}
                onPress={() => selectSession(index)}
              />
            ))}
          </SegmentedGroup>
        ) : (
          <SegmentedListItem isFirst isLast>
            <View style={{ padding: spacing[4] }}>
              <EmptyInfo>
                <LimitedHtml value={t('workout.no_workouts_in_plan.message')} />
              </EmptyInfo>
            </View>
          </SegmentedListItem>
        )}
      </TitledSection>

      {days && !reordering ? (
        <SegmentedGroup>
          <SegmentedListLink
            label={t('plan.muscle_analysis.title')}
            icon={AccessibilityNewIcon}
            systemImage="figure.arms.open"
            onPress={() => push(getMuscleAnalysisHref(programId))}
          />
          <SegmentListFormElement
            label={t('plan.share.button')}
            icon={ShareIcon}
            systemImage="square.and.arrow.up"
            onPress={() =>
              dispatch(
                encryptAndShare({
                  title: t('plan.shared_item.title'),
                  item: new SharedProgramBlueprint(program),
                }),
              )
            }
          />
        </SegmentedGroup>
      ) : undefined}
    </SettingsPage>
  );
}
