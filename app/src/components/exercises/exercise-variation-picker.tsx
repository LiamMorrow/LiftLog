import CheckIcon from '@expo/material-symbols/check.xml';
import CloseIcon from '@expo/material-symbols/close.xml';
import { AppText } from '@/components/foundation/app-text';
import Form from '@/components/foundation/form';
import { PageActions } from '@/components/foundation/page-actions';
import { SegmentedGroup } from '@/components/foundation/segmented-list';
import { SegmentedListOption } from '@/components/foundation/segmented-list-option';
import { SegmentedListTextInput } from '@/components/foundation/segmented-list-text-input';
import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { resolveExerciseVariation } from '@/components/exercises/exercise-variation';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { useAppSelector } from '@/store';
import { setExerciseSearchResult } from '@/store/app';
import { selectExercises, updateExercise } from '@/store/stored-sessions';
import { uuid } from '@/utils/uuid';
import { useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

type Variation = 'none' | 'left' | 'right' | 'custom';
const variations: Variation[] = ['none', 'left', 'right', 'custom'];

export function ExerciseVariationPicker({ exercise, requestId }: { exercise: ExerciseDescriptor; requestId: string }) {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { dismiss } = useRouter();
  const exercises = useAppSelector(selectExercises);
  const [variation, setVariation] = useState<Variation>('none');
  const [customName, setCustomName] = useState('');
  const labels = {
    none: t('exercise.variation.none.label'),
    left: t('exercise.variation.left.label'),
    right: t('exercise.variation.right.label'),
    custom: t('generic.custom.label'),
  };
  const suffix = variation === 'none' ? '' : variation === 'custom' ? customName : labels[variation];
  const resolved = resolveExerciseVariation(exercise, suffix, exercises);
  const canSave = variation !== 'custom' || !!customName.trim();

  const save = () => {
    if (!canSave) {
      return;
    }
    if (resolved.isNew) {
      dispatch(updateExercise({ id: uuid(), exercise: resolved.exercise }));
    }
    dispatch(setExerciseSearchResult({ requestId, exercise: resolved.exercise }));
    dismiss(2);
  };

  return (
    <FullHeightScrollView
      modal
      avoidKeyboard
      floatingChildren={
        <PageActions
          primaryKind="commit"
          primary={{
            label: t('generic.done.button'),
            icon: CheckIcon,
            systemImage: 'checkmark',
            disabled: !canSave,
            onPress: save,
          }}
          secondary={[
            {
              label: t('generic.cancel.button'),
              icon: CloseIcon,
              systemImage: 'xmark',
              onPress: () => dismiss(),
            },
          ]}
        />
      }
    >
      <Stack.Screen options={{ title: t('exercise.variation.title') }} />
      <Form>
        <AppText variant="titleLarge" testID="exercise-variation-preview">
          {resolved.exercise.name}
        </AppText>
        <SegmentedGroup>
          {variations.map((value) => (
            <SegmentedListOption
              key={value}
              label={labels[value]}
              selected={variation === value}
              onPress={() => setVariation(value)}
              testID={`exercise-variation-${value}`}
            />
          ))}
        </SegmentedGroup>
        {variation === 'custom' ? (
          <SegmentedGroup>
            <SegmentedListTextInput
              label={t('exercise.variation.custom_name.label')}
              value={customName}
              onChangeText={setCustomName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={save}
              testID="exercise-variation-custom-name"
            />
          </SegmentedGroup>
        ) : undefined}
      </Form>
    </FullHeightScrollView>
  );
}
