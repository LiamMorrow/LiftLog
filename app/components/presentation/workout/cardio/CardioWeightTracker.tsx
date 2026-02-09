import { CardioValueSelector } from '@/components/presentation/workout/cardio/CardioValueSelector';
import BigNumber from 'bignumber.js';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { Weight } from '@/models/weight';
import { WeightEditor } from '@/components/presentation/foundation/editors/weight-editor';

export function CardioWeightTracker({
  weight,
  updateWeight,
}: {
  weight: Weight;
  updateWeight: (weight: Weight | undefined) => void;
}) {
  const { t } = useTranslate();
  const [dialogValue, setDialogValue] = useState(weight);
  return (
    <CardioValueSelector
      buttonText={weight.shortLocaleFormat()}
      label={t('weight.weight.label')}
      onButtonPress={() => setDialogValue(weight)}
      onSave={() => updateWeight(dialogValue)}
      onHold={() => updateWeight(undefined)}
      style={{ flexDirection: 'column', alignItems: 'stretch' }}
    >
      <WeightEditor
        increment={BigNumber(2.5)}
        updateWeight={setDialogValue}
        weight={weight}
        allowNegative
      />
    </CardioValueSelector>
  );
}
