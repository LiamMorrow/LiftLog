import { FormRow } from '@/components/presentation/foundation/form-row';
import { spacing } from '@/hooks/useAppTheme';
import { CardioExerciseBlueprint, ExerciseBlueprint, WeightedExerciseBlueprint } from '@/models/blueprint-models';
import { useTranslate } from '@tolgee/react';
import { TextInput } from 'react-native-paper';

export function SharedFieldsEditor({
  exercise,
  updateExercise,
}: {
  exercise: ExerciseBlueprint;
  updateExercise: (ex: Partial<CardioExerciseBlueprint | WeightedExerciseBlueprint>) => void;
}) {
  const { t } = useTranslate();
  return (
    <>
      <FormRow>
        <TextInput
          mode="outlined"
          label={t('plan.notes.label')}
          testID="exercise-notes"
          style={{ marginBottom: spacing[2] }}
          value={exercise.notes}
          onChangeText={(notes) => updateExercise({ notes })}
          multiline
        />
      </FormRow>
      <FormRow>
        <TextInput
          mode="outlined"
          testID="exercise-link"
          label={t('generic.external_link.label')}
          style={{ marginBottom: spacing[2] }}
          placeholder="https://"
          value={exercise.link}
          onChangeText={(link) => updateExercise({ link })}
        />
      </FormRow>
    </>
  );
}
