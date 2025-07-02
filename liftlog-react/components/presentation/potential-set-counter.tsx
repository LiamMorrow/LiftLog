import { PotentialSet } from '@/models/session-models';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { TouchableRipple } from 'react-native-paper';
import { Text, Touchable } from 'react-native';
import WeightFormat from '@/components/presentation/weight-format';
import WeightDialog from '@/components/presentation/weight-dialog';
import { useAppTheme, spacing } from '@/hooks/useAppTheme';
import { PressableProps } from 'react-native-paper/lib/typescript/components/TouchableRipple/Pressable';
import FocusRing from '@/components/presentation/focus-ring';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import {
  endIncreasingHoldHaptics,
  startIncreasingHoldHaptics,
} from '@/store/app';

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
  const { colors } = useAppTheme();
  const holdingScale = useSharedValue(1);
  const showWeightAnimatedValue = useSharedValue(props.showWeight ? 1 : 0);
  const [isHolding, setIsHolding] = useState(false);
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const repCountValue = props.set?.set?.repsCompleted;
  const dispatch = useDispatch();

  useEffect(() => {
    showWeightAnimatedValue.value = withTiming(props.showWeight ? 1 : 0, {
      duration: 150,
    });
  }, [props.showWeight, showWeightAnimatedValue]);

  useEffect(() => {
    holdingScale.value = withTiming(isHolding ? 1.1 : 1, {
      duration: 400,
    });
  }, [holdingScale, isHolding]);

  const borderRadiusStyle = useAnimatedStyle(() => ({
    borderBottomLeftRadius: interpolate(
      showWeightAnimatedValue.value,
      [0, 1],
      [10, 0],
    ),
    borderBottomRightRadius: interpolate(
      showWeightAnimatedValue.value,
      [0, 1],
      [10, 0],
    ),
  }));

  const heightStyle = useAnimatedStyle(() => ({
    height: interpolate(showWeightAnimatedValue.value, [0, 1], [0, spacing[9]]),
    width: interpolate(showWeightAnimatedValue.value, [0, 1], [0, spacing[14]]),
    padding: interpolate(
      showWeightAnimatedValue.value,
      [0, 1],
      [0, spacing[2]],
    ),
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: holdingScale.value }],
  }));

  const enterHold = () => {
    setIsHolding(true);
    dispatch(startIncreasingHoldHaptics());
  };
  const exitHold = () => {
    setIsHolding(false);
    dispatch(endIncreasingHoldHaptics({ completedHold: false }));
  };

  const callbacks = props.isReadonly
    ? {}
    : ({
        onPress: props.onTap,
        onLongPress: () => {
          dispatch(endIncreasingHoldHaptics({ completedHold: true }));
          props.onHold();
        },
        onTouchStart: enterHold,
        onPointerDown: enterHold,
        onPointerUp: exitHold,
        onPointerLeave: exitHold,
        onTouchEnd: exitHold,
      } satisfies Touchable & Omit<PressableProps, 'children'>);

  return (
    <FocusRing isSelected={props.toStartNext} radius={15}>
      <Animated.View
        style={[
          scaleStyle,
          {
            justifyContent: 'center',
            alignItems: 'center',
            userSelect: 'none',
          },
        ]}
      >
        <Animated.View
          style={[
            {
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              overflow: 'hidden',
            },
            borderRadiusStyle,
          ]}
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
          style={[
            {
              borderTopWidth: 1,
              borderColor: colors.outline,
              backgroundColor: colors.surfaceContainerHigh,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              overflow: 'hidden',
            },
            heightStyle,
          ]}
        >
          <TouchableRipple
            style={{
              alignItems: 'center',
              margin: -spacing[2],
              padding: spacing[2],
            }}
            onPress={
              props.isReadonly ? undefined! : () => setIsWeightDialogOpen(true)
            }
            disabled={props.isReadonly}
          >
            <Text style={{ color: colors.onSurface }}>
              <WeightFormat weight={props.set.weight} />
            </Text>
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
    </FocusRing>
  );
}
