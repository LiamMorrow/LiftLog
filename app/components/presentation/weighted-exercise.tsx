import PotentialSetCounter from '@/components/presentation/potential-set-counter';
import { spacing } from '@/hooks/useAppTheme';
import { RecordedWeightedExercise } from '@/models/session-models';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { View } from 'react-native';
import { WeightAppliesTo } from '@/store/current-session';
import ExerciseSection from '@/components/presentation/exercise-section';
import PotentialSetAdditionalActionsDialog from '@/components/presentation/potential-sets-addition-actions-dialog';

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
    weight: BigNumber,
    applyTo: WeightAppliesTo,
  ) => void;
  updateNotesForExercise: (notes: string) => void;
  onOpenLink: () => void;
  onEditExercise: () => void;
  onRemoveExercise: () => void;
}

export default function WeightedExercise(props: WeightedExerciseProps) {
  const { updateRepCountForSet } = props;
  const { recordedExercise } = props;
  useState(false);
  const [additionalPotentialSetIndex, setAdditionalPotentialSetIndex] =
    useState(-1);

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
      updateNotesForExercise={props.updateNotesForExercise}
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
            onTap={() => props.cycleRepCountForSet(index)}
            onHold={() => setAdditionalPotentialSetIndex(index)}
            onUpdateWeight={(w, applyTo) =>
              props.updateWeightForSet(index, w, applyTo)
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
      <PotentialSetAdditionalActionsDialog
        open={additionalPotentialSetIndex !== -1}
        repTarget={props.recordedExercise.blueprint.repsPerSet}
        set={props.recordedExercise.potentialSets[additionalPotentialSetIndex]}
        updateRepCount={(reps) =>
          updateRepCountForSet(additionalPotentialSetIndex, reps)
        }
        close={() => setAdditionalPotentialSetIndex(-1)}
      />
    </ExerciseSection>
  );
}
