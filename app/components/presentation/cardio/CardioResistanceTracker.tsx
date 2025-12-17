import { CardioValueSelector } from '@/components/presentation/cardio/CardioValueSelector';
import { DecimalEditor } from '@/components/presentation/DecimalEditor';
import BigNumber from 'bignumber.js';
import { localeFormatBigNumber } from '@/utils/locale-bignumber';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';

export function CardioResistanceTracker({
  resistance,
  updateResistance,
}: {
  resistance: BigNumber;
  updateResistance: (resistance: BigNumber | undefined) => void;
}) {
  const { t } = useTranslate();
  const [dialogValue, setDialogValue] = useState(resistance);
  return (
    <CardioValueSelector
      buttonText={localeFormatBigNumber(resistance)}
      label={t('exercise.resistance.label')}
      onButtonPress={() => setDialogValue(resistance)}
      onSave={() => updateResistance(dialogValue)}
      onHold={() => updateResistance(undefined)}
    >
      <DecimalEditor
        style={{ flex: 1 }}
        value={dialogValue}
        onChange={(value) => setDialogValue(value)}
      />
    </CardioValueSelector>
  );
}
