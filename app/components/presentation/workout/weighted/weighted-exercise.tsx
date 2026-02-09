import PotentialSetCounter from '@/components/presentation/workout/weighted/potential-set-counter';
import { spacing } from '@/hooks/useAppTheme';
import { RecordedWeightedExercise } from '@/models/session-models';
import { useState } from 'react';
import { View } from 'react-native';
import { WeightAppliesTo } from '@/store/current-session';
import ExerciseSection from '@/components/presentation/workout/exercise-section';
import { Weight } from '@/models/weight';

interface WeightedExerciseProps {
  recordedExercise: RecordedWeightedExercise;
  previousRecordedExercises: RecordedWeightedExercise[];
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;

  cycleRepCountForSet: (setIndex: number) => void;
  updateRepCountForSet: (setIndex: number, reps: number | undefined) => void;
  updateWeightForSet: (
    setIndex: number,
    weight: Weight,
    applyTo: WeightAppliesTo,
  ) => void;
  updateNotesForExercise: (notes: string) => void;
  onOpenLink: () => void;
  onEditExercise: () => void;
  onRemoveExercise: () => void;
}

export default function WeightedExercise(props: WeightedExerciseProps) {
  const {
    updateRepCountForSet,
    cycleRepCountForSet,
    updateNotesForExercise,
    updateWeightForSet,
  } = props;
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
      updateNotesForExercise={updateNotesForExercise}
      onOpenLink={props.onOpenLink}
      onEditExercise={props.onEditExercise}
      onRemoveExercise={props.onRemoveExercise}
    >
      <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
        {recordedExercise.potentialSets.map((set, index) => (
          <PotentialSetCounter
            isReadonly={props.isReadonly}
            key={index}
            maxReps={recordedExercise.blueprint.repsPerSet}
            onTap={() => cycleRepCountForSet(index)}
            onUpdateReps={(reps) => updateRepCountForSet(index, reps)}
            onUpdateWeight={(w, applyTo) =>
              updateWeightForSet(index, w, applyTo)
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
