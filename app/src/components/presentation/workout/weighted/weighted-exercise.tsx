import PotentialSetCounter from '@/components/presentation/workout/weighted/potential-set-counter';
import { spacing } from '@/hooks/useAppTheme';
import { RecordedWeightedExercise } from '@/models/session-models';
import { ReactNode, useState } from 'react';
import { View } from 'react-native';
import ExerciseSection from '@/components/presentation/workout/exercise-section';
import { OffsetDateTime } from '@js-joda/core';
import { Updater } from '@/utils/types';
import { useTranslate } from '@tolgee/react';
import { useAppSelector } from '@/store';

interface WeightedExerciseProps {
  recordedExercise: RecordedWeightedExercise;
  previousLineageExercise: RecordedWeightedExercise | undefined;
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;
  titleLeading?: ReactNode;

  timeProvider: () => OffsetDateTime;
  updateExercise: (update: Updater<RecordedWeightedExercise>) => void;
  onEditExercise: (() => void) | undefined;
  onRemoveExercise: () => void;
  onMoveExerciseUp: (() => void) | undefined;
  onMoveExerciseDown: (() => void) | undefined;
}

export default function WeightedExercise(props: WeightedExerciseProps) {
  const { updateExercise, timeProvider } = props;
  const { recordedExercise } = props;
  const { t } = useTranslate();
  const [weightEditOriginal, setWeightEditOriginal] = useState<RecordedWeightedExercise>();
  const showPreviousReps = useAppSelector((x) => x.settings.showPreviousRepsInWorkout);

  const setToStartNext = recordedExercise.potentialSets.findIndex((x) => !x.isComplete);

  return (
    <ExerciseSection
      recordedExercise={props.recordedExercise}
      previousLineageExercise={props.previousLineageExercise}
      toStartNext={props.toStartNext}
      isReadonly={props.isReadonly}
      showPreviousButton={props.showPreviousButton}
      titleLeading={props.titleLeading}
      updateExercise={props.updateExercise}
      onEditExercise={props.onEditExercise}
      onRemoveExercise={props.onRemoveExercise}
      onMoveExerciseUp={props.onMoveExerciseUp}
      onMoveExerciseDown={props.onMoveExerciseDown}
    >
      <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
        {recordedExercise.potentialSets.map((set, index) => (
          <PotentialSetCounter
            isReadonly={props.isReadonly}
            key={index}
            repsTarget={recordedExercise.repsTargetForSet(index)}
            onTap={() => {
              const time = timeProvider();
              updateExercise((ex) => ex.withCycledRepCount(index, time));
            }}
            previousRepCount={
              showPreviousReps ? props.previousLineageExercise?.potentialSets[index]?.set?.repsCompleted : undefined
            }
            onUpdateReps={(reps) => {
              const time = timeProvider();
              updateExercise((ex) => ex.withRepCount(index, reps, time));
            }}
            editorSubtitle={t('exercise.set_of_exercise.label', {
              exercise: recordedExercise.blueprint.name,
              number: index + 1,
            })}
            onBeginWeightEdit={() => setWeightEditOriginal(recordedExercise)}
            onUpdateWeight={(w, applyTo) =>
              updateExercise((ex) => ex.withWeightOver(weightEditOriginal ?? ex, index, w, applyTo))
            }
            set={set}
            hasRemainingSets={recordedExercise.potentialSets.some((s) => !s.set)}
            toStartNext={props.toStartNext && setToStartNext === index && !props.isReadonly}
            resistance={recordedExercise.blueprint.resistance}
            weightIncrement={recordedExercise.blueprint.weightIncrement}
          />
        ))}
      </View>
    </ExerciseSection>
  );
}
