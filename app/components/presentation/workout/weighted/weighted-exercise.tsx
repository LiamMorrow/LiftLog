import PotentialSetCounter from '@/components/presentation/workout/weighted/potential-set-counter';
import { spacing } from '@/hooks/useAppTheme';
import { RecordedWeightedExercise } from '@/models/session-models';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { WeightAppliesTo } from '@/store/current-session';
import ExerciseSection from '@/components/presentation/workout/exercise-section';
import { Weight } from '@/models/weight';
import { Text } from 'react-native-paper';

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
  const [collapsed, setCollapsed] = useState(recordedExercise.isComplete);
  const wasComplete = useRef(recordedExercise.isComplete);

  const setToStartNext = recordedExercise.potentialSets.findIndex(
    (x) => !x.set,
  );
  const completedSets = recordedExercise.potentialSets.filter((set) => set.set);
  const completedSetsSummary = completedSets
    .map(
      (set) =>
        `${set.set!.repsCompleted}@${set.weight.shortLocaleFormat()}`,
    )
    .join('  ');
  const compactSummary =
    completedSetsSummary ||
    `${completedSets.length}/${recordedExercise.potentialSets.length}`;

  useEffect(() => {
    if (recordedExercise.isComplete && !wasComplete.current) {
      setCollapsed(true);
    }
    if (!recordedExercise.isComplete && wasComplete.current) {
      setCollapsed(false);
    }
    wasComplete.current = recordedExercise.isComplete;
  }, [recordedExercise.isComplete]);

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
      compact={collapsed}
      compactSummary={
        <Text
          numberOfLines={1}
          variant="bodyLarge"
          style={{ opacity: 0.85, fontWeight: '500' }}
        >
          {compactSummary}
        </Text>
      }
      onToggleCompact={() => setCollapsed((value) => !value)}
    >
      <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
        {recordedExercise.potentialSets.map((set, index) => (
          <PotentialSetCounter
            isReadonly={props.isReadonly}
            key={index}
            maxReps={recordedExercise.blueprint.repsPerSet}
            previousRepCount={
              props.previousRecordedExercises.at(0)?.potentialSets[index]?.set
                ?.repsCompleted
            }
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
