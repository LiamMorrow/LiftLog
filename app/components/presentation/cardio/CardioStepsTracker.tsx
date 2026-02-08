import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { CardioValueSelector } from '@/components/presentation/cardio/CardioValueSelector';
import { IntegerEditor } from '@/components/presentation/IntegerEditor';

export function CardioStepsTracker({
  steps,
  updateSteps,
}: {
  steps: number;
  updateSteps: (steps: number | undefined) => void;
}) {
  const { t } = useTranslate();
  const [dialogValue, setDialogValue] = useState(steps);
  return (
    <CardioValueSelector
      buttonText={steps.toString()}
      label={t('exercise.steps.label')}
      onButtonPress={() => setDialogValue(steps)}
      onSave={() => updateSteps(dialogValue)}
      onHold={() => updateSteps(undefined)}
    >
      <IntegerEditor
        style={{ flex: 1 }}
        value={dialogValue}
        onChange={(value) => setDialogValue(value)}
      />
    </CardioValueSelector>
  );
}
