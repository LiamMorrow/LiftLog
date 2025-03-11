import { PotentialSet } from '@/models/session-models';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { TouchableRipple, useTheme } from 'react-native-paper';
import {
  Animated,
  Easing,
  Text,
  Touchable,
  useAnimatedValue,
  View,
} from 'react-native';
import WeightFormat from '@/components/presentation/weight-format';
import WeightDialog from '@/components/presentation/weight-dialog';
import { useBaseThemeset } from '@/hooks/useBaseThemeset';
import { PressableProps } from 'react-native-paper/lib/typescript/components/TouchableRipple/Pressable';

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
  const theme = useBaseThemeset();
  const scaleValue = useAnimatedValue(1);
  const weightScaleValue = useAnimatedValue(props.showWeight ? 1 : 0);
  const [isHolding, setIsHolding] = useState(false);
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const repCountValue = props.set?.set?.repsCompleted;
  const repCountRounding = props.showWeight ? 'rounded-t-xl' : 'rounded-xl';
  const boxShadowFill = repCountValue === undefined ? '2rem' : '0';
  const holdingClass = isHolding ? 'scale-110' : '';

  useEffect(() => {
    Animated.timing(scaleValue, {
      toValue: isHolding ? 1.1 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isHolding, scaleValue]);

  useEffect(() => {
    Animated.timing(weightScaleValue, {
      toValue: props.showWeight ? 1 : 0,
      duration: 150,
      easing: Easing.cubic,
      useNativeDriver: false,
    }).start();
  }, [props.showWeight, weightScaleValue]);

  const textColorClass =
    repCountValue !== undefined
      ? 'text-on-primary'
      : 'text-on-secondary-container';

  const callbacks = props.isReadonly
    ? {}
    : ({
        onPress: props.onTap,
        onLongPress: props.onHold,
        onTouchStart: () => setIsHolding(true),
        onPointerDown: () => setIsHolding(true),
        onPointerUp: () => setIsHolding(false),
        onPointerLeave: () => setIsHolding(false),
        onTouchEnd: () => setIsHolding(false),
      } satisfies Touchable & Omit<PressableProps, 'children'>);

  return (
    <Animated.View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        userSelect: 'none',
        transform: [
          {
            scale: scaleValue,
          },
        ],
      }}
    >
      <TouchableRipple
        style={{
          aspectRatio: 1,
          flexShrink: 0,
          padding: 0,
          height: 56,
          width: 56,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          borderBottomRightRadius: props.showWeight ? 0 : 10,
          borderBottomLeftRadius: props.showWeight ? 0 : 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            repCountValue !== undefined
              ? theme.primary
              : theme.secondaryContainer,
        }}
        {...callbacks}
        disabled={props.isReadonly}
      >
        <Text
          style={{
            color:
              repCountValue !== undefined
                ? theme.onPrimary
                : theme.onSecondaryContainer,
          }}
        >
          <Text style={{ fontWeight: 'bold' }}>{repCountValue ?? '-'}</Text>
          <Text style={{ fontSize: 12, verticalAlign: 'top' }}>
            /{props.maxReps}
          </Text>
        </Text>
      </TouchableRipple>
      <Animated.View
        style={{
          height: weightScaleValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 36],
          }),
          paddingBlock: weightScaleValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 8],
          }),
          width: weightScaleValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 56],
          }),
          borderTopWidth: weightScaleValue,
          borderColor: theme.outline,
          backgroundColor: theme.surfaceContainerHigh,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
        }}
      >
        <TouchableRipple
          style={{
            alignItems: 'center',
          }}
          onPress={
            props.isReadonly ? undefined : () => setIsWeightDialogOpen(true)
          }
          disabled={props.isReadonly}
        >
          <WeightFormat weight={props.set.weight} suffixClass="" />
        </TouchableRipple>
      </Animated.View>
      <WeightDialog
        open={isWeightDialogOpen}
        increment={props.weightIncrement}
        weight={props.set.weight}
        onClose={() => setIsWeightDialogOpen(false)}
        updateWeight={props.onUpdateWeight}
      />
    </Animated.View>
  );
}
