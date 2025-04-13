import WeightDialog from '@/components/presentation/weight-dialog';
import WeightFormat from '@/components/presentation/weight-format';
import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';

type WeightDisplayProps = {
  increment: BigNumber;
  label?: string;
  isReadonly?: boolean;
} & (
  | {
      allowNull: true;
      weight: BigNumber | undefined;
      updateWeight: (weight: BigNumber | undefined) => void;
    }
  | {
      allowNull?: false;
      weight: BigNumber;
      updateWeight: (weight: BigNumber) => void;
    }
);
export default function WeightDisplay(props: WeightDisplayProps) {
  const { colors } = useAppTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <View>
      <Button
        data-cy="weight-display"
        mode="text"
        onPress={() => setDialogOpen(true)}
        labelStyle={{ ...font['text-lg'] }}
      >
        <WeightFormat weight={props.weight} />
      </Button>
      {props.isReadonly ? null : (
        <WeightDialog
          open={dialogOpen}
          weight={props.weight as BigNumber}
          increment={props.increment}
          label={props.label}
          allowNull={props.allowNull as false}
          updateWeight={props.updateWeight as (weight: BigNumber) => void}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </View>
  );
}
