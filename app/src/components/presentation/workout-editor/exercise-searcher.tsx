import Button from '@/components/presentation/foundation/button';
import { ExerciseBlueprint } from '@/models/blueprint-models';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { useAppSelector } from '@/store';
import { clearExerciseSearchResult } from '@/store/app';
import { uuid } from '@/utils/uuid';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { useDispatch } from 'react-redux';

interface ExerciseSearcherProps {
  currentExercise: ExerciseBlueprint;
  onSelectExercise: (e: ExerciseDescriptor) => void;
}

export function ExerciseSearcher({ currentExercise, onSelectExercise }: ExerciseSearcherProps) {
  const { push } = useRouter();
  const dispatch = useDispatch();
  const [requestId] = useState(() => uuid());
  const searchResult = useAppSelector((x) => x.app.exerciseSearchResult);

  useEffect(() => {
    if (searchResult?.requestId !== requestId) {
      return;
    }
    onSelectExercise(searchResult.exercise);
    dispatch(clearExerciseSearchResult());
  }, [onSelectExercise, searchResult, requestId, dispatch]);

  const openSearch = () => {
    Keyboard.dismiss();
    push({
      pathname: '/exercise-search',
      params: { requestId, exerciseName: currentExercise.name },
    });
  };

  return (
    <Button icon={'contentPasteSearch'} mode="contained" onPress={openSearch}>
      {currentExercise.name}
    </Button>
  );
}
