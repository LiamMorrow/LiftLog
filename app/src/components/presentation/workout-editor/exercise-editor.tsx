import Form from '@/components/presentation/foundation/form';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSelect } from '@/components/presentation/foundation/segmented-list-select';
import { CardioExerciseEditor } from '@/components/presentation/workout-editor/cardio-exercise-editor';
import { ExerciseSearcher } from '@/components/presentation/workout-editor/exercise-searcher';
import {
  ResistanceSelect,
  WeightedExerciseEditor,
} from '@/components/presentation/workout-editor/weighted-exercise-editor';
import { CardioExerciseBlueprint, ExerciseBlueprint, WeightedExerciseBlueprint } from '@/models/blueprint-models';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { match, P } from 'ts-pattern';
import { useDerivedState } from '@/hooks/useDerivedState';
import { useTranslate } from '@tolgee/react';

interface ExerciseEditorProps {
  exercise: ExerciseBlueprint;
  updateExercise: (ex: ExerciseBlueprint) => void;
}

export function ExerciseEditor(props: ExerciseEditorProps) {
  const { t } = useTranslate();
  const selectExerciseFromSearch = (ex: ExerciseDescriptor) => {
    updateExercise({ name: ex.name });
  };
  const { exercise: propsExercise, updateExercise: updatePropsExercise } = props;
  const [exercise, setExercise] = useDerivedState(propsExercise, (p) => p);
  const commit = (next: CardioExerciseBlueprint | WeightedExerciseBlueprint) => {
    setExercise(next);
    updatePropsExercise(next);
  };
  const updateExercise = (ex: Partial<WeightedExerciseBlueprint | CardioExerciseBlueprint>) => {
    commit(exercise.with(ex as unknown as Partial<WeightedExerciseBlueprint & CardioExerciseBlueprint>));
  };

  const handleTypeChange = (type: 'weighted' | 'cardio') => {
    let newExercise: CardioExerciseBlueprint | WeightedExerciseBlueprint = exercise;
    if (type === 'weighted') {
      newExercise = WeightedExerciseBlueprint.empty().with({
        name: exercise.name,
        notes: exercise.notes,
        link: exercise.link,
      });
    } else {
      newExercise = CardioExerciseBlueprint.empty().with({
        name: exercise.name,
        notes: exercise.notes,
        link: exercise.link,
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
    <Form>
      <ExerciseSearcher currentExercise={exercise} onSelectExercise={selectExerciseFromSearch} />
      {exerciseEditor}
      <SegmentedGroup>
        <SegmentedListSelect
          key="type"
          label={t('exercise.type.label')}
          icon={exercise instanceof WeightedExerciseBlueprint ? 'fitnessCenter' : 'directionsRun'}
          testID="exercise-type"
          value={exercise instanceof WeightedExerciseBlueprint ? 'weighted' : 'cardio'}
          options={[
            { value: 'weighted', label: t('exercise.type.weighted.label') },
            { value: 'cardio', label: t('exercise.type.cardio.label') },
          ]}
          onChange={handleTypeChange}
        />
        {exercise instanceof WeightedExerciseBlueprint ? (
          <ResistanceSelect key="resistance" exercise={exercise} updateExercise={updateExercise} />
        ) : undefined}
      </SegmentedGroup>
    </Form>
  );
}
