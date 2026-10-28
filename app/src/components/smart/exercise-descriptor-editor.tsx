import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import ExerciseMuscleSelector from '@/components/presentation/workout-editor/exercise-muscle-selector';
import { spacing } from '@/hooks/useAppTheme';
import { useOnDismiss } from '@/hooks/useOnDismiss';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { useAppSelectorWithArg } from '@/store';
import { selectExerciseById, updateExercise } from '@/store/stored-sessions';
import { useTranslate } from '@tolgee/react';
import { Href, Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export function getExerciseDescriptorEditorHref(exerciseId: string, opts?: { isNew?: boolean }): Href {
  return `/exercise-descriptor-editor?exerciseId=${encodeURIComponent(exerciseId)}${opts?.isNew ? '&isNew=1' : ''}`;
}

export function ExerciseDescriptorEditor(props: { exerciseId: string; isNew?: boolean }) {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { dismiss } = useRouter();
  const exercise = useAppSelectorWithArg(selectExerciseById, props.exerciseId);
  const [draft, setDraft] = useState<ExerciseDescriptor>();
  const shown = draft ?? exercise;

  const title = props.isNew ? t('exercise.add.title') : t('exercise.edit.title');

  const update = (changes: Partial<ExerciseDescriptor>) => {
    if (shown) {
      setDraft({ ...shown, ...changes });
    }
  };

  useOnDismiss(() => {
    if (draft && exercise) {
      dispatch(updateExercise({ id: props.exerciseId, exercise: draft }));
    }
  });

  const hasExercise = !!exercise;
  useEffect(() => {
    if (!hasExercise) {
      dismiss();
    }
  }, [hasExercise, dismiss]);

  return (
    <FullHeightScrollView avoidKeyboard modal scrollStyle={{ padding: spacing.pageHorizontalMargin }}>
      <Stack.Screen options={{ title }} />
      {shown && (
        <View style={{ gap: spacing[2], paddingBottom: spacing[12] }}>
          <TextInput
            mode="outlined"
            label={t('exercise.name.label')}
            value={shown.name}
            onChangeText={(name) => update({ name })}
            selectTextOnFocus={props.isNew}
            testID="exercise-name-input"
          />
          <TextInput
            mode="outlined"
            label={t('generic.instructions.label')}
            value={shown.instructions}
            onChangeText={(instructions) => update({ instructions })}
            multiline
            testID="exercise-instructions-input"
          />
          <ExerciseMuscleSelector muscles={shown.muscles} onChange={(muscles) => update({ muscles })} showMuscleMap />
        </View>
      )}
    </FullHeightScrollView>
  );
}
