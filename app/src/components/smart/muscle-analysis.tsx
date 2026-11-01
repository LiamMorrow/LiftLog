import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import { SegmentedList } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListLink } from '@/components/presentation/foundation/segmented-list-link';
import { MuscleMap } from '@/components/presentation/muscles/muscle-map';
import { MuscleVolumeList } from '@/components/presentation/muscles/muscle-volume-list';
import { getExerciseDescriptorEditorHref } from '@/components/smart/exercise-descriptor-editor';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { selectProgram } from '@/store/program';
import { selectExercises, selectMuscles, updateExercise } from '@/store/stored-sessions';
import {
  analyseMuscleVolume,
  indexDescriptorsByName,
  plannedExerciseSets,
  UnmatchedExercise,
} from '@/utils/muscle-volume';
import { uuid } from '@/utils/uuid';
import { useTranslate } from '@tolgee/react';
import { Href, Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { Chip } from '@/components/presentation/foundation/chip';
import { useDispatch } from 'react-redux';

export function getMuscleAnalysisHref(programId: string): Href {
  return `/muscle-analysis?programId=${encodeURIComponent(programId)}`;
}

export function MuscleAnalysis(props: { programId: string }) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const dispatch = useDispatch();
  const { push } = useRouter();
  const program = useAppSelectorWithArg(selectProgram, props.programId);
  const exercises = useAppSelector(selectExercises);
  const allMuscles = useAppSelector(selectMuscles);
  const [sessionIndex, setSessionIndex] = useState<number>();

  const sessions =
    sessionIndex === undefined ? program.sessions : program.sessions.slice(sessionIndex, sessionIndex + 1);
  const planned = plannedExerciseSets(sessions);
  const analysis = analyseMuscleVolume(planned, indexDescriptorsByName(exercises), allMuscles);
  const topSets = analysis.muscles[0]?.sets ?? 0;

  const editExercise = (exercise: UnmatchedExercise) => {
    if (exercise.exerciseId) {
      push(getExerciseDescriptorEditorHref(exercise.exerciseId));
      return;
    }
    const id = uuid();
    dispatch(
      updateExercise({
        id,
        exercise: {
          name: exercise.name,
          category: '',
          equipment: null,
          force: null,
          instructions: '',
          level: 'beginner',
          mechanic: null,
          muscles: [],
        },
      }),
    );
    push(getExerciseDescriptorEditorHref(id));
  };

  return (
    <FullHeightScrollView modal scrollStyle={{ paddingHorizontal: spacing.pageHorizontalMargin }}>
      <Stack.Screen options={{ title: t('plan.muscle_analysis.title') }} />
      <View style={{ gap: spacing[4], paddingBottom: spacing[12] }}>
        {program.sessions.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -spacing.pageHorizontalMargin }}
            contentContainerStyle={{ gap: spacing[2], paddingHorizontal: spacing.pageHorizontalMargin }}
          >
            <Chip mode="outlined" selected={sessionIndex === undefined} onPress={() => setSessionIndex(undefined)}>
              {t('plan.muscle_analysis.whole_plan.label')}
            </Chip>
            {program.sessions.map((session, index) => (
              <Chip
                mode="outlined"
                key={index}
                selected={sessionIndex === index}
                onPress={() => setSessionIndex(index)}
              >
                {session.name}
              </Chip>
            ))}
          </ScrollView>
        )}
        {planned.length ? (
          <>
            <MuscleMap
              intensities={Object.fromEntries(analysis.muscles.map((m) => [m.muscle, topSets ? m.sets / topSets : 0]))}
              style={{ maxWidth: 320, alignSelf: 'center' }}
            />
            <AppText variant="labelMedium" style={{ alignSelf: 'flex-end', color: colors.onSurfaceVariant }}>
              {t('plan.muscle_analysis.sets_per_cycle.label')}
            </AppText>
            <MuscleVolumeList muscles={analysis.muscles} />
            {analysis.unmatchedExercises.length > 0 && (
              <View style={{ gap: spacing[2] }}>
                <AppText variant="titleSmall">{t('plan.muscle_analysis.unmatched.title')}</AppText>
                <AppText variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                  {t('plan.muscle_analysis.unmatched.subtitle')}
                </AppText>
                <SegmentedList
                  items={analysis.unmatchedExercises}
                  itemKey={(exercise) => exercise.name}
                  renderItem={(exercise) => (
                    <SegmentedListLink label={exercise.name} onPress={() => editExercise(exercise)} />
                  )}
                />
              </View>
            )}
          </>
        ) : (
          <EmptyInfo style={{ marginTop: spacing[8] }}>
            <AppText>{t('plan.muscle_analysis.empty.body')}</AppText>
          </EmptyInfo>
        )}
      </View>
    </FullHeightScrollView>
  );
}
