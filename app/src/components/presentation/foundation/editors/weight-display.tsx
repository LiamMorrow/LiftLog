import WeightFormat from '@/components/presentation/foundation/weight-format';
import { font } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import Button from '@/components/presentation/foundation/button';
import { Weight } from '@/models/weight';
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

  return (
    <>
      <Button
        testID="weight-display"
        mode="text"
        onPress={() => setEditorOpen(true)}
        labelStyle={{ ...font['text-lg'] }}
      >
        <WeightFormat weight={props.weight} color={'primary'} />
      </Button>
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
