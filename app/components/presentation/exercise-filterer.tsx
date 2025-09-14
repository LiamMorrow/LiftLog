import ExerciseSearchAndFilters from '@/components/presentation/exercise-search-and-filters';
import { useAppSelector } from '@/store';
import { selectExercises } from '@/store/stored-sessions';
import Enumerable from 'linq';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export default function ExerciseFilterer(props: {
  onFilteredExerciseIdsChange: (ids: string[]) => void;
}) {
  const exercises = useAppSelector(selectExercises);
  const { onFilteredExerciseIdsChange } = props;
  const [muscleFilters, setMuscleFilters] = useState([] as string[]);
  const [searchText, setSearchText] = useState('');

  const search = useDebouncedCallback(() => {
    const searchRegex = new RegExp(escapeRegExp(searchText), 'i');
    const matchRegex = new RegExp('^' + escapeRegExp(searchText) + '$', 'i');
    const newFilteredExercises = Enumerable.from(Object.entries(exercises))
      .where(
        (x) =>
          (!muscleFilters.length ||
            x[1].muscles.some((exerciseMuscle) =>
              muscleFilters.includes(exerciseMuscle),
            )) &&
          (!searchText || searchRegex.test(x[1].name)),
      )
      .orderByDescending((x) => matchRegex.test(x[1].name))
      .select((x) => x[0])
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
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
