import { NativeIconButton } from '@/components/presentation/foundation/native-icon-button';
import SearchIcon from '@expo/material-symbols/search.xml';
import { spacing } from '@/hooks/useAppTheme';
import { ExerciseBlueprint } from '@/models/blueprint-models';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { useAppSelector } from '@/store';
import { clearExerciseSearchResult } from '@/store/app';
import { uuid } from '@/utils/uuid';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, Pressable, View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { useDispatch } from 'react-redux';

interface ExerciseSearcherProps {
  currentExercise: ExerciseBlueprint;
  onSelectExercise: (e: ExerciseDescriptor) => void;
}

export function ExerciseSearcher({ currentExercise, onSelectExercise }: ExerciseSearcherProps) {
  const { push } = useRouter();
  const { t } = useTranslate();
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
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
      <Pressable testID="exercise-name" accessibilityRole="button" onPress={openSearch} style={{ flex: 1 }}>
        <AppText variant="headlineMedium">{currentExercise.name}</AppText>
      </Pressable>
      <NativeIconButton
        icon={SearchIcon}
        systemImage="magnifyingglass"
        variant="tonal"
        label={t('generic.search.button')}
        onPress={openSearch}
      />
    </View>
  );
}
