import WeightDialog from '@/components/presentation/weight-dialog';
import WeightFormat from '@/components/presentation/weight-format';
import { font } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import Button from '@/components/presentation/gesture-wrappers/button';
import { Weight } from '@/models/weight';

type WeightDisplayProps = {
  increment: BigNumber;
  label?: string;
  isReadonly?: boolean;
  allowNegative?: boolean;
} & (
  | {
      allowNull: true;
      weight: Weight | undefined;
      updateWeight: (weight: Weight | undefined) => void;
    }
  | {
      allowNull?: false;
      weight: Weight;
      updateWeight: (weight: Weight) => void;
    }
);
export default function WeightDisplay(props: WeightDisplayProps) {
  const { t } = useTranslate();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        testID="weight-display"
        mode="text"
        onPress={() => setDialogOpen(true)}
        labelStyle={{ ...font['text-lg'] }}
      >
        <WeightFormat weight={props.weight} color={'primary'} />
      </Button>
      {props.isReadonly ? null : (
        <WeightDialog
          open={dialogOpen}
          weight={props.weight as Weight}
          increment={props.increment}
          allowNegative={props.allowNegative}
          label={props.label ?? t('weight.weight.label')}
          allowNull={props.allowNull as false}
          updateWeight={props.updateWeight as (weight: Weight) => void}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  );
}
