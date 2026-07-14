import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import { ExerciseBlueprint } from '@/models/blueprint-models';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { useAppSelector } from '@/store';
import { clearExerciseSearchResult } from '@/store/app';
import { uuid } from '@/utils/uuid';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Keyboard } from 'react-native';
import { useDispatch } from 'react-redux';

interface ExerciseSearcherProps {
  currentExercise: ExerciseBlueprint;
  onSelectExercise: (e: ExerciseDescriptor) => void;
}

export function ExerciseSearcher({ currentExercise, onSelectExercise }: ExerciseSearcherProps) {
  const { push } = useRouter();
  const dispatch = useDispatch();
  const requestId = useRef(uuid()).current;
  const searchResult = useAppSelector((x) => x.app.exerciseSearchResult);

  const onSelectRef = useRef(onSelectExercise);
  onSelectRef.current = onSelectExercise;

  useEffect(() => {
    if (searchResult?.requestId !== requestId) {
      return;
    }
    onSelectRef.current(searchResult.exercise);
    dispatch(clearExerciseSearchResult());
  }, [searchResult, requestId, dispatch]);

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
