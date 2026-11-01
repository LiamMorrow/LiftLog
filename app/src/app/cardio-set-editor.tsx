import DeleteIcon from '@expo/material-symbols/delete.xml';
import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import Form from '@/components/presentation/foundation/form';
import { SegmentedGroup, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { CardioSetEditor } from '@/components/presentation/workout-editor/cardio-exercise-editor';
import { CardioExerciseSetBlueprint } from '@/models/blueprint-models';
import { CardioExerciseSetBlueprintJSON } from '@/models/storage/versions/latest';
import { setCardioSetEdit } from '@/store/app';
import { useTranslate } from '@tolgee/react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

export default function CardioSetEditorPage() {
  const params = useLocalSearchParams<{ requestId: string; setIndex: string; set: string; canRemove?: string }>();
  const setIndex = Number(params.setIndex);
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { dismiss } = useRouter();
  const [set, setSet] = useState(() =>
    CardioExerciseSetBlueprint.fromJSON(JSON.parse(params.set) as CardioExerciseSetBlueprintJSON),
  );

  const updateSet = (next: CardioExerciseSetBlueprint) => {
    setSet(next);
    dispatch(setCardioSetEdit({ requestId: params.requestId, setIndex, set: next.toJSON() }));
  };
  const removeSet = () => {
    dispatch(setCardioSetEdit({ requestId: params.requestId, setIndex, set: null }));
    dismiss();
  };

  return (
    <FullHeightScrollView modal avoidKeyboard>
      <Stack.Screen options={{ title: t('exercise.set_number.label', { number: setIndex + 1 }) }} />
      <Form>
        <CardioSetEditor set={set} updateSet={updateSet} />
        {params.canRemove === 'true' ? (
          <SegmentedGroup>
            <SegmentListFormElement
              testID="cardio-remove-set"
              label={t('exercise.cardio_set.remove.button')}
              icon={DeleteIcon}
              systemImage="trash"
              destructive
              onPress={removeSet}
            />
          </SegmentedGroup>
        ) : undefined}
      </Form>
    </FullHeightScrollView>
  );
}
