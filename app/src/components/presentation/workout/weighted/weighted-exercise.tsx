import PotentialSetCounter from '@/components/presentation/workout/weighted/potential-set-counter';
import { spacing } from '@/hooks/useAppTheme';
import { RecordedWeightedExercise } from '@/models/session-models';
import { useState } from 'react';
import { View } from 'react-native';
import ExerciseSection from '@/components/presentation/workout/exercise-section';
import { OffsetDateTime } from '@js-joda/core';
import { Updater } from '@/utils/types';
import { KeyedExerciseBlueprint } from '@/models/blueprint-models';

interface WeightedExerciseProps {
  recordedExercise: RecordedWeightedExercise;
  previousRecordedExercises: RecordedWeightedExercise[];
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;

  timeProvider: () => OffsetDateTime;
  updateExercise: (update: Updater<RecordedWeightedExercise>) => void;
  resetSetTimer: () => void;
  onEditExercise: () => void;
  onRemoveExercise: () => void;
}

export default function WeightedExercise(props: WeightedExerciseProps) {
  const { updateExercise, timeProvider, resetSetTimer } = props;
  const { recordedExercise } = props;
  useState(false);

  const setToStartNext = recordedExercise.potentialSets.findIndex((x) => !x.set);

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
            repsTarget={recordedExercise.blueprint.repsTargetForSet(index)}
            onTap={() => {
              const previousSet = set.set;
              const newSet = recordedExercise.withCycledRepCount(index, timeProvider()).getSet(index).set;
              updateExercise((ex) => ex.withCycledRepCount(index, timeProvider()));
              // We only want to reset the timer when switching between unfilled and filled
              // Otherwise, keep the same time
              if (!previousSet || !newSet) {
                resetSetTimer();
              }
            }}
            previousRepCount={
              props.previousRecordedExercises
                .filter(
                  (x) =>
                    KeyedExerciseBlueprint.fromExerciseBlueprint(x.blueprint).toString() ===
                    KeyedExerciseBlueprint.fromExerciseBlueprint(props.recordedExercise.blueprint).toString(),
                )
                .at(0)?.potentialSets[index]?.set?.repsCompleted
            }
            onUpdateReps={(reps) => {
              updateExercise((ex) => ex.withRepCount(index, reps, timeProvider()));
              resetSetTimer();
            }}
            onUpdateWeight={(w, applyTo) => updateExercise((ex) => ex.withWeight(index, w, applyTo))}
            set={set}
            toStartNext={props.toStartNext && setToStartNext === index && !props.isReadonly}
            usesBodyweight={recordedExercise.blueprint.usesBodyweight}
            weightIncrement={recordedExercise.blueprint.progressiveOverload.weightIncrement}
          />
        ))}
      </View>
    </ExerciseSection>
  );
}
