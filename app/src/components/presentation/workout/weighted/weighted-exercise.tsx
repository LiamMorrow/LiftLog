import PotentialSetCounter from '@/components/presentation/workout/weighted/potential-set-counter';
import { spacing } from '@/hooks/useAppTheme';
import { RecordedWeightedExercise } from '@/models/session-models';
import { useState } from 'react';
import { View } from 'react-native';
import ExerciseSection from '@/components/presentation/workout/exercise-section';
import { OffsetDateTime } from '@js-joda/core';

interface WeightedExerciseProps {
  recordedExercise: RecordedWeightedExercise;
  previousRecordedExercises: RecordedWeightedExercise[];
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;

  timeProvider: () => OffsetDateTime;
  updateExercise: (ex: RecordedWeightedExercise) => void;
  resetSetTimer: () => void;
  onEditExercise: () => void;
  onRemoveExercise: () => void;
}

export default function WeightedExercise(props: WeightedExerciseProps) {
  const { updateExercise, timeProvider, resetSetTimer } = props;
  const { recordedExercise } = props;
  useState(false);

  const setToStartNext = recordedExercise.potentialSets.findIndex(
    (x) => !x.set,
  );

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
            maxReps={recordedExercise.blueprint.repsPerSet}
            onTap={() => {
              const previousSet = recordedExercise.potentialSets[index].set;
              const newExercise = recordedExercise.withCycledRepCount(
                index,
                timeProvider(),
              );
              const newSet = newExercise.potentialSets[index].set;
              updateExercise(newExercise);
              // We only want to reset the timer when switching between unfilled and filled
              // Otherwise, keep the same time
              if (!previousSet || !newSet) {
                resetSetTimer();
              }
            }}
            onUpdateReps={(reps) => {
              updateExercise(
                recordedExercise.withRepCount(index, reps, timeProvider()),
              );
              resetSetTimer();
            }}
            onUpdateWeight={(w, applyTo) =>
              updateExercise(recordedExercise.withWeight(index, w, applyTo))
            }
            set={set}
            showWeight={true}
            toStartNext={
              props.toStartNext && setToStartNext === index && !props.isReadonly
            }
            weightIncrement={recordedExercise.blueprint.weightIncreaseOnSuccess}
          />
        ))}
      </View>
    </ExerciseSection>
  );
}
