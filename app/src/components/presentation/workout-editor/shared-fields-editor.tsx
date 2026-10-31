import { TitledSection } from '@/components/presentation/foundation/titled-section';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListTextInput } from '@/components/presentation/foundation/segmented-list-text-input';
import { CardioExerciseBlueprint, ExerciseBlueprint, WeightedExerciseBlueprint } from '@/models/blueprint-models';
import { useTranslate } from '@tolgee/react';

export function SharedFieldsEditor({
  exercise,
  updateExercise,
}: {
  exercise: ExerciseBlueprint;
  updateExercise: (ex: Partial<CardioExerciseBlueprint | WeightedExerciseBlueprint>) => void;
}) {
  const { t } = useTranslate();
  return (
    <TitledSection title={t('generic.notes.label')}>
      <SegmentedGroup>
        <SegmentedListTextInput
          label={t('plan.notes.label')}
          testID="exercise-notes"
          value={exercise.notes}
          onChangeText={(notes) => updateExercise({ notes })}
          multiline
        />
        <SegmentedListTextInput
          label={t('generic.external_link.label')}
          testID="exercise-link"
          placeholder="https://"
          value={exercise.link}
          onChangeText={(link) => updateExercise({ link })}
        />
      </SegmentedGroup>
    </TitledSection>
  );
}
