import { PotentialSet } from '@/models/session-models';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { TouchableRipple } from 'react-native-paper';
import { Text, View } from 'react-native';
import WeightFormat from '@/components/presentation/weight-format';
import WeightDialog from '@/components/presentation/weight-dialog';

interface PotentialSetCounterProps {
  set: PotentialSet;
  showWeight: boolean;
  weightIncrement: BigNumber;
  maxReps: number;
  toStartNext: boolean;
  isReadonly: boolean;

  onTap: () => void;
  onHold: () => void;
  onUpdateWeight: (weight: BigNumber) => void;
}

export default function PotentialSetCounter(props: PotentialSetCounterProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const repCountValue = props.set?.set?.repsCompleted;
  const repCountRounding = props.showWeight ? 'rounded-t-xl' : 'rounded-xl';
  const weightScale = props.showWeight ? 'p-2 h-8 w-14' : 'h-0 w-0 p-0';
  const boxShadowFill = repCountValue === undefined ? '2rem' : '0';
  const holdingClass = isHolding ? 'scale-110' : '';
  const colorClass =
    repCountValue !== undefined ? 'bg-primary' : 'bg-secondary-container';
  const textColorClass =
    repCountValue !== undefined
      ? 'text-on-primary'
      : 'text-on-secondary-container';

  const callbacks = props.isReadonly
    ? {}
    : {
        onPress: props.onTap,
        onLongPress: props.onHold,
        onPointerDown: () => setIsHolding(true),
        onPointerUp: () => setIsHolding(false),
        onPointerLeave: () => setIsHolding(false),
      };

  return (
    <View className="select-none justify-center items-center">
      <TouchableRipple
        className={`
          aspect-square
          flex-shrink-0
          text-center
          p-0
          h-14
          w-14
          ${repCountRounding}
          [transition:border-radius_150ms_cubic-bezier(0.4,0,0.2,1),background-color_150ms_cubic-bezier(0.4,0,0.2,1),transform_400ms]
          items-center
          align-middle
          justify-center
          ${holdingClass}
          ${colorClass}`}
        {...callbacks}
        disabled={props.isReadonly}
      >
        <Text className={textColorClass}>
          <Text className="font-bold">{repCountValue ?? '-'}</Text>
          <Text className="inline text-sm align-text-top">
            /{props.maxReps}
          </Text>
        </Text>
      </TouchableRipple>
      <TouchableRipple
        className={`
          rounded-b-xl
          ${weightScale}
          overflow-hidden
          ${holdingClass}
          text-xs
          [transition:height_150ms_cubic-bezier(0.4,0,0.2,1),padding_150ms_cubic-bezier(0.4,0,0.2,1),width_150ms_cubic-bezier(0.4,0,0.2,1),transform_400ms]
          flex
          flex-row
          border-t
          justify-center
          border-outline
          bg-surface-container-high
          text-on-surface-variant`}
        onPress={
          props.isReadonly ? undefined : () => setIsWeightDialogOpen(true)
        }
        disabled={props.isReadonly}
      >
        <WeightFormat weight={props.set.weight} suffixClass="" />
      </TouchableRipple>
      <WeightDialog
        open={isWeightDialogOpen}
        increment={props.weightIncrement}
        weight={props.set.weight}
        onClose={() => setIsWeightDialogOpen(false)}
        updateWeight={props.onUpdateWeight}
      />
    </View>
  );
}
