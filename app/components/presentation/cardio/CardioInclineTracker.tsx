import BigNumber from 'bignumber.js';
import { localeFormatBigNumber } from '@/utils/locale-bignumber';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { CardioValueSelector } from '@/components/presentation/cardio/CardioValueSelector';
import { DecimalEditor } from '@/components/presentation/DecimalEditor';

export function CardioInclineTracker({
  incline,
  updateIncline,
}: {
  incline: BigNumber;
  updateIncline: (incline: BigNumber | undefined) => void;
}) {
  const { t } = useTranslate();
  const [dialogValue, setDialogValue] = useState(incline);
  return (
    <CardioValueSelector
      buttonText={localeFormatBigNumber(incline)}
      label={t('exercise.incline.label')}
      onButtonPress={() => setDialogValue(incline)}
      onSave={() => updateIncline(dialogValue)}
      onHold={() => updateIncline(undefined)}
    >
      <DecimalEditor
        style={{ flex: 1 }}
        value={dialogValue}
        onChange={(value) => setDialogValue(value)}
      />
    </CardioValueSelector>
  );
}
