import { useAppTheme } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { Icon } from '@/components/presentation/foundation/icon';
import { ListItem } from '@/components/presentation/foundation/list-item';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import AddIcon from '@expo/material-symbols/add.xml';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { useScroll } from '@/hooks/useScrollListener';
import {
  deleteExercise as deleteExerciseAction,
  restoreExercise,
  selectExerciseById,
  selectExercises,
  setFilteredExerciseIds as setFilteredExerciseIdsAction,
  updateExercise,
} from '@/store/stored-sessions';
import { RootState, useAppSelector, useAppSelectorWithArg } from '@/store';
import { useDispatch, useStore } from 'react-redux';
import { uuid } from '@/utils/uuid';
import { SwipeRow } from 'react-native-swipe-list-view';
import { showSnackbar } from '@/store/app';
import { useMountEffect } from '@/hooks/useMountEffect';
import ExerciseFilterer from '@/components/presentation/workout-editor/exercise-filterer';
import { LegendList } from '@legendapp/list/react-native';
import { translateExerciseMeta } from '@/utils/exercise-meta';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getExerciseDescriptorEditorHref } from '@/components/smart/exercise-descriptor-editor';

function ExerciseListItem({ exerciseId, onDelete }: { exerciseId: string; onDelete: () => void }) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const { push } = useRouter();
  const exercise = useAppSelectorWithArg(selectExerciseById, exerciseId);

  const rowRef = useRef<SwipeRow<unknown>>(null);
  useEffect(() => {
    rowRef.current?.closeRowWithoutAnimation();
  }, [exerciseId]);
  if (!exercise) {
    return <View></View>;
  }

  return (
    // @ts-expect-error -- Swipe row seems to have trouble with typescript, it works
    <SwipeRow disableRightSwipe ref={rowRef} rightActivationValue={-70} rightActionValue={-70} rightOpenValue={-70}>
      <View
        style={{
          alignItems: 'flex-end',
          justifyContent: 'center',
          flex: 1,
          paddingVertical: 4,
        }}
      >
        <TouchableRipple
          onPress={onDelete}
          style={{
            height: '100%',
            width: 70,
            backgroundColor: colors.error,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          testID={`exercise-delete-btn`}
        >
          <Icon source={'delete'} size={30} color={colors.onError} />
        </TouchableRipple>
      </View>
      <ListItem
        title={exercise.name}
        // Important to have a space to ensure they are all the same size
        // Otherwise delete button can show through when there is no desc
        description={exercise.muscles.map((m) => translateExerciseMeta(t, 'muscle', m)).join(', ') || ' '}
        descriptionNumberOfLines={1}
        style={{ backgroundColor: colors.surface }}
        onPress={() => {
          if (!rowRef.current?.isOpen) {
            push(getExerciseDescriptorEditorHref(exerciseId));
          }
        }}
        testID="exercise-row"
      />
    </SwipeRow>
  );
}

export default function ExerciseManager() {
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const { getState } = useStore<RootState>();
  const { push } = useRouter();
  const exercises = useAppSelector(selectExercises);
  const filteredExerciseIds = useAppSelector((s) => s.storedSessions.filteredExerciseIds);
  const setFilteredExerciseIds = (ids: string[]) => {
    dispatch(setFilteredExerciseIdsAction(ids));
  };

  useMountEffect(() => {
    setFilteredExerciseIds(Object.keys(exercises));
  });
  const insets = useSafeAreaInsets();
  const [floatingBottomSize, setFloatingBottomSize] = useState(0);
  const bottomInsetHeight = floatingBottomSize + (Platform.select({ ios: insets.bottom }) ?? 0);

  const addExercise = () => {
    const newId = uuid();
    dispatch(
      updateExercise({
        id: newId,
        exercise: {
          name: 'New exercise',
          category: '',
          equipment: null,
          force: null,
          instructions: '',
          level: 'beginner',
          mechanic: null,
          muscles: [],
        },
      }),
    );
    setFilteredExerciseIds([newId, ...filteredExerciseIds]);
    push(getExerciseDescriptorEditorHref(newId, { isNew: true }));
  };

  const deleteExercise = (id: string) => {
    const state = getState().storedSessions;
    const isBuiltIn = !!state.builtInExercises[id];
    const savedExercise = state.savedExercises[id];
    const exercise = exercises[id];
    if (!exercise) {
      return;
    }

    setFilteredExerciseIds(filteredExerciseIds.filter((x) => x !== id));
    dispatch(deleteExerciseAction(id));
    // Built-ins are tombstoned, so undo restores the tombstone; user exercises are re-inserted.
    const undoAction =
      isBuiltIn || !savedExercise ? restoreExercise(id) : updateExercise({ id, exercise: savedExercise });
    dispatch(
      showSnackbar({
        text: t('deletion.item_deleted.message', { name: exercise.name }),
        action: t('generic.undo.button'),
        dispatchAction: [undoAction, setFilteredExerciseIdsAction(filteredExerciseIds)],
      }),
    );
  };

  const flatListItems = useMemo(() => ['filter', ...filteredExerciseIds], [filteredExerciseIds]);
  const { handleScroll } = useScroll();
  return (
    <SafeAreaView style={{ flex: 1 }} edges={{ left: 'additive', right: 'additive', top: 'off', bottom: 'off' }}>
      <LegendList
        onScroll={handleScroll}
        contentContainerStyle={{
          paddingBottom: bottomInsetHeight,
        }}
        style={{ flex: 1 }}
        data={flatListItems}
        estimatedItemSize={64}
        recycleItems
        getItemType={(_, index) => (index === 0 ? 'filters' : 'exercise')}
        keyExtractor={(item, index) => (index === 0 ? 'filters' : item)}
        renderItem={({ item, index }) => {
          if (index === 0) {
            return (
              <ExerciseFilterer
                exerciseName=""
                onFilteredExerciseIdsChange={setFilteredExerciseIds}
                onSuggestedNewExercise={() => {}}
              />
            );
          }
          return <ExerciseListItem exerciseId={item} onDelete={() => deleteExercise(item)} />;
        }}
      />
      <View
        onLayout={(event) => setFloatingBottomSize(event.nativeEvent.layout.height)}
        style={{
          position: 'absolute',
          bottom: Platform.select({ ios: insets.bottom }) ?? 0,
          width: '100%',
        }}
      >
        <PageActions
          primary={{
            label: t('exercise.add.button'),
            icon: AddIcon,
            systemImage: 'plus',
            onPress: addExercise,
          }}
        />
      </View>
    </SafeAreaView>
  );
}
