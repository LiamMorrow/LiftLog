import { useTranslate } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { NativeButton } from '@/components/presentation/foundation/native-button';
import { shortFormatWeightUnit, Weight } from '@/models/weight';
import { localeDisplayFormatBigNumber } from '@/utils/locale-bignumber';
import { DockedEditor } from '@/components/presentation/workout/edit-dock';
import { WeightEditor } from '@/components/presentation/foundation/editors/weight-editor';

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
  const [editorOpen, setEditorOpen] = useState(false);
  const value = localeDisplayFormatBigNumber(props.weight?.value.decimalPlaces(4)) || '-';
  const label = `${value} ${shortFormatWeightUnit(props.weight?.unit)}`.trim();

  return (
    <>
      <NativeButton testID="weight-display" variant="text" label={label} onPress={() => setEditorOpen(true)} />
      {props.isReadonly ? null : (
        <DockedEditor
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          title={props.label ?? t('weight.weight.label')}
        >
          {props.allowNull ? (
            <WeightEditor
              allowNull
              weight={props.weight}
              updateWeight={props.updateWeight}
              increment={props.increment}
              allowNegative={props.allowNegative}
            />
          ) : (
            <WeightEditor
              weight={props.weight}
              updateWeight={props.updateWeight}
              increment={props.increment}
              allowNegative={props.allowNegative}
            />
          )}
        </DockedEditor>
      )}
    </>
  );
}
