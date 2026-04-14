import ExerciseSearchAndFilters from '@/components/presentation/workout-editor/exercise-search-and-filters';
import { fuzzyMatchScore } from '@/components/presentation/workout-editor/exercise-fuzzy-match';
import { useAppSelector } from '@/store';
import { ExerciseDescriptor, selectExercises } from '@/store/stored-sessions';
import Enumerable from 'linq';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export default function ExerciseFilterer(props: {
  onFilteredExerciseIdsChange: (ids: string[]) => void;
  exercises?: Record<string, ExerciseDescriptor>;
}) {
  const storedExercises = useAppSelector(selectExercises);
  const exercises = props.exercises ?? storedExercises;
  const { onFilteredExerciseIdsChange } = props;
  const [muscleFilters, setMuscleFilters] = useState([] as string[]);
  const [searchText, setSearchText] = useState('');

  const search = useDebouncedCallback(() => {
    const trimmedSearchText = searchText.trim();
    const newFilteredExercises = Enumerable.from(Object.entries(exercises))
      .select((x) => ({
        entry: x,
        score: trimmedSearchText
          ? fuzzyMatchScore(trimmedSearchText, x[1].name)
          : 0,
      }))
      .where(
        (x) =>
          (!muscleFilters.length ||
            x.entry[1].muscles.some((exerciseMuscle) =>
              muscleFilters.includes(exerciseMuscle),
            )) &&
          (!trimmedSearchText || x.score !== null),
      )
      .orderByDescending((x) => x.score ?? 0)
      .thenBy((x) => x.entry[1].name)
      .select((x) => x.entry[0])
      .toArray();
    onFilteredExerciseIdsChange(newFilteredExercises);
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
