import { FormRow } from '@/components/presentation/foundation/form-row';
import Form from '@/components/presentation/foundation/form';
import SegmentedPicker from '@/components/presentation/foundation/segmented-picker';
import { CardioExerciseEditor } from '@/components/presentation/workout-editor/cardio-exercise-editor';
import { ExerciseSearcher } from '@/components/presentation/workout-editor/exercise-searcher';
import { WeightedExerciseEditor } from '@/components/presentation/workout-editor/weighted-exercise-editor';
import DirectionsRunIcon from '@expo/material-symbols/directions_run.xml';
import FitnessCenterIcon from '@expo/material-symbols/fitness_center.xml';
import { spacing } from '@/hooks/useAppTheme';
import { CardioExerciseBlueprint, ExerciseBlueprint, WeightedExerciseBlueprint } from '@/models/blueprint-models';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { match, P } from 'ts-pattern';

interface ExerciseEditorProps {
  exercise: ExerciseBlueprint;
  updateExercise: (ex: ExerciseBlueprint) => void;
}

export function ExerciseEditor(props: ExerciseEditorProps) {
  const selectExerciseFromSearch = (ex: ExerciseDescriptor) => {
    updateExercise({ name: ex.name });
  };
  const { exercise: propsExercise, updateExercise: updatePropsExercise } = props;
  const [exercise, setExercise] = useState(propsExercise);
  const exerciseRef = useRef(exercise);
  exerciseRef.current = exercise;

  // Bit of a hack to let us update exercise immediately without going through the whole props loop
  useEffect(() => {
    setExercise(propsExercise);
  }, [propsExercise]);
  const commit = (next: CardioExerciseBlueprint | WeightedExerciseBlueprint) => {
    exerciseRef.current = next;
    setExercise(next);
    updatePropsExercise(next);
  };
  const updateExercise = (ex: Partial<WeightedExerciseBlueprint | CardioExerciseBlueprint>) => {
    commit(exerciseRef.current.with(ex as unknown as Partial<WeightedExerciseBlueprint & CardioExerciseBlueprint>));
  };

  const handleTypeChange = (type: string) => {
    const current = exerciseRef.current;
    let newExercise: CardioExerciseBlueprint | WeightedExerciseBlueprint = current;
    if (type === 'weighted') {
      newExercise = WeightedExerciseBlueprint.empty().with({
        // oxlint-disable-next-line typescript/no-misused-spread
        ...current,
        type: 'WeightedExerciseBlueprint',
        sets: undefined!, // Will not overwrite empty
      });
    } else {
      newExercise = CardioExerciseBlueprint.empty().with({
        // oxlint-disable-next-line typescript/no-misused-spread
        ...current,
        type: 'CardioExerciseBlueprint',
        sets: undefined!, // Will not overwrite empty
      });
    }
    commit(newExercise);
  };

  const exerciseEditor = match(exercise)
    .with(P.instanceOf(WeightedExerciseBlueprint), (e) => (
      <WeightedExerciseEditor exercise={e} updateExercise={updateExercise} />
    ))
    .with(P.instanceOf(CardioExerciseBlueprint), (e) => (
      <CardioExerciseEditor exercise={e} updateExercise={updateExercise} />
    ))
    .exhaustive();

  return (
    <View style={{ paddingVertical: spacing.pageHorizontalMargin }}>
      <Form>
        <FormRow>
          <ExerciseSearcher currentExercise={exercise} onSelectExercise={selectExerciseFromSearch} />
        </FormRow>
        <FormRow>
          <SegmentedPicker
            value={exercise instanceof WeightedExerciseBlueprint ? 'weighted' : 'cardio'}
            options={[
              {
                value: 'weighted',
                label: 'Weighted',
                icon: FitnessCenterIcon,
                systemImage: 'dumbbell',
                testID: 'weighted-button',
              },
              {
                value: 'cardio',
                label: 'Cardio/Time',
                icon: DirectionsRunIcon,
                systemImage: 'figure.run',
                testID: 'cardio-button',
              },
            ]}
            onChange={handleTypeChange}
          />
        </FormRow>
        {exerciseEditor}
      </Form>
    </View>
  );
}
