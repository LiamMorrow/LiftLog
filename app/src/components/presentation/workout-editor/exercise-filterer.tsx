import { fuzzyMatchScore } from '@/components/presentation/workout-editor/exercise-fuzzy-match';
import ExerciseSearchAndFilters from '@/components/presentation/workout-editor/exercise-search-and-filters';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { useAppSelector } from '@/store';
import { selectExercises } from '@/store/stored-sessions';
import Enumerable from 'linq';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export default function ExerciseFilterer(props: {
  exerciseName: string
  onFilteredExerciseIdsChange: (ids: string[]) => void;
  onSuggestedNewExercise: (exerciseDescriptor: ExerciseDescriptor | 'NONE') => void;
}) {
  const exercises = useAppSelector(selectExercises);
  const { onFilteredExerciseIdsChange, onSuggestedNewExercise } = props;
  const [muscleFilters, setMuscleFilters] = useState([] as string[]);
  const [searchText, setSearchText] = useState(props.exerciseName);

  const search = useDebouncedCallback(() => {
    const trimmed = searchText.trim();
    const trimmedSearchText = escapeRegExp(trimmed);
    const fullMatchRegex = new RegExp('^' + trimmedSearchText + '$', 'i');
    let hasExactMatch = false;
    const newFilteredExercises = Enumerable.from(Object.entries(exercises))
      .select((x) => ({
        entry: { id: x[0], exercise: x[1] },
        score: trimmedSearchText ? fuzzyMatchScore(trimmedSearchText, x[1].name) : 0,
      }))
      .where(
        (x) =>
          (!muscleFilters.length ||
            x.entry.exercise.muscles.some((exerciseMuscle) => muscleFilters.includes(exerciseMuscle))) &&
          (!trimmedSearchText || x.score !== null),
      )
      .orderByDescending((x) => x.score ?? 0)
      .thenBy((x) => x.entry.exercise.name)
      .doAction((x) => {
        if (!hasExactMatch && trimmedSearchText && fullMatchRegex.test(x.entry.exercise.name)) {
          hasExactMatch = true;
        }
      })
      .select((x) => x.entry.id)
      .toArray();
    onFilteredExerciseIdsChange(newFilteredExercises);
    if (!hasExactMatch && trimmedSearchText) {
      onSuggestedNewExercise({
        name: trimmed,
        category: '',
        equipment: null,
        force: null,
        instructions: '',
        level: '',
        mechanic: '',
        muscles: muscleFilters,
      });
    } else {
      onSuggestedNewExercise('NONE');
    }
  }, 100);

  return (
    <ExerciseSearchAndFilters
      searchText={searchText}
      setSearchText={(s) => {
        setSearchText(s);
        search();
      }}
      muscleFilters={muscleFilters}
      setMuscleFilters={(m) => {
        setMuscleFilters(m);
        search();
      }}
    />
  );
}
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
