import { PotentialSet } from '@/models/session-models';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { TouchableRipple } from 'react-native-paper';
import { Text, Touchable } from 'react-native';
import WeightFormat from '@/components/presentation/weight-format';
import WeightDialog from '@/components/presentation/weight-dialog';
import { useAppTheme } from '@/hooks/useAppTheme';
import { PressableProps } from 'react-native-paper/lib/typescript/components/TouchableRipple/Pressable';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';

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
  const { colors, spacing } = useAppTheme();
  const holdingScale = useSharedValue(1);
  const weightHeight = useSharedValue(0);
  const weightWidth = useSharedValue(0);
  const weightPadding = useSharedValue(0);
  const bottomBorderRadius = useSharedValue(10);
  const [isHolding, setIsHolding] = useState(false);
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const repCountValue = props.set?.set?.repsCompleted;

  useEffect(() => {
    bottomBorderRadius.value = withTiming(props.showWeight ? 0 : 10, {
      duration: 150,
    });
    weightHeight.value = withTiming(props.showWeight ? spacing[9] : 0, {
      duration: 150,
    });
    weightWidth.value = withTiming(props.showWeight ? spacing[14] : 0, {
      duration: 150,
    });
    weightPadding.value = withTiming(props.showWeight ? spacing[2] : 0, {
      duration: 150,
    });
  }, [
    props.showWeight,
    bottomBorderRadius,
    weightHeight,
    weightWidth,
    weightPadding,
    spacing,
  ]);

  useEffect(() => {
    holdingScale.value = withTiming(isHolding ? 1.1 : 1, { duration: 400 });
  }, [isHolding, holdingScale]);

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
            scale: holdingScale,
          },
        ],
      }}
    >
      <Animated.View
        style={{
          borderBottomLeftRadius: bottomBorderRadius,
          borderBottomRightRadius: bottomBorderRadius,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          overflow: 'hidden',
        }}
      >
        <TouchableRipple
          style={{
            aspectRatio: 1,
            flexShrink: 0,
            padding: 0,
            height: spacing[14],
            width: spacing[14],
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:
              repCountValue !== undefined
                ? colors.primary
                : colors.secondaryContainer,
          }}
          {...callbacks}
          disabled={props.isReadonly}
        >
          <Text
            style={{
              color:
                repCountValue !== undefined
                  ? colors.onPrimary
                  : colors.onSecondaryContainer,
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>{repCountValue ?? '-'}</Text>
            <Text style={{ fontSize: 12, verticalAlign: 'top' }}>
              /{props.maxReps}
            </Text>
          </Text>
        </TouchableRipple>
      </Animated.View>
      <Animated.View
        style={{
          height: weightHeight,
          width: weightWidth,
          padding: weightPadding,
          borderTopWidth: 1,
          borderColor: colors.outline,
          backgroundColor: colors.surfaceContainerHigh,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          overflow: 'hidden',
        }}
      >
        <TouchableRipple
          style={{
            alignItems: 'center',
            margin: -spacing[2],
            padding: spacing[2],
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
