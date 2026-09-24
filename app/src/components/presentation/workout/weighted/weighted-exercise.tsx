import PotentialSetCounter from '@/components/presentation/workout/weighted/potential-set-counter';
import { spacing } from '@/hooks/useAppTheme';
import { RecordedWeightedExercise } from '@/models/session-models';
import { useState } from 'react';
import { View } from 'react-native';
import ExerciseSection from '@/components/presentation/workout/exercise-section';
import { OffsetDateTime } from '@js-joda/core';
import { Updater } from '@/utils/types';

interface WeightedExerciseProps {
  recordedExercise: RecordedWeightedExercise;
  previousRecordedExercises: RecordedWeightedExercise[];
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;

  timeProvider: () => OffsetDateTime;
  updateExercise: (update: Updater<RecordedWeightedExercise>) => void;
  onEditExercise: (() => void) | undefined;
  onRemoveExercise: () => void;
}

export default function WeightedExercise(props: WeightedExerciseProps) {
  const { updateExercise, timeProvider } = props;
  const { recordedExercise } = props;
  useState(false);

  const setToStartNext = recordedExercise.potentialSets.findIndex((x) => !x.isComplete);

  return (
    <ExerciseSection
      recordedExercise={props.recordedExercise}
      previousRecordedExercises={props.previousRecordedExercises}
      toStartNext={props.toStartNext}
      isReadonly={props.isReadonly}
      showPreviousButton={props.showPreviousButton}
      updateExercise={props.updateExercise}
      onEditExercise={props.onEditExercise}
      onRemoveExercise={props.onRemoveExercise}
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
              props.previousRecordedExercises
                .filter((x) => x.progressionKey() === props.recordedExercise.progressionKey())
                .at(0)?.potentialSets[index]?.set?.repsCompleted
            }
            onUpdateReps={(reps) => {
              const time = timeProvider();
              updateExercise((ex) => ex.withRepCount(index, reps, time));
            }}
            onUpdateWeight={(w, applyTo) => updateExercise((ex) => ex.withWeight(index, w, applyTo))}
            set={set}
            toStartNext={props.toStartNext && setToStartNext === index && !props.isReadonly}
            resistance={recordedExercise.blueprint.resistance}
            weightIncrement={recordedExercise.blueprint.weightIncrement}
          />
        ))}
      </View>
    </ExerciseSection>
  );
}
