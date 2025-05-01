import { PotentialSet } from '@/models/session-models';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { TouchableRipple } from 'react-native-paper';
import { Text, Touchable, View } from 'react-native';
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
import * as Haptics from 'expo-haptics';

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

  useEffect(() => {
    showWeightAnimatedValue.value = withTiming(props.showWeight ? 1 : 0, {
      duration: 150,
    });
  }, [props.showWeight]);

  useEffect(() => {
    holdingScale.value = withTiming(isHolding ? 1.1 : 1, {
      duration: 400,
    });
  }, [isHolding]);

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

  const callbacks = props.isReadonly
    ? {}
    : ({
        onPress: props.onTap,
        onLongPress: () => {
          Haptics.selectionAsync();
          props.onHold();
        },
        onTouchStart: () => setIsHolding(true),
        onPointerDown: () => setIsHolding(true),
        onPointerUp: () => setIsHolding(false),
        onPointerLeave: () => setIsHolding(false),
        onTouchEnd: () => setIsHolding(false),
      } satisfies Touchable & Omit<PressableProps, 'children'>);

  return (
    <FocusRing isSelected={props.toStartNext} radius={15} style={scaleStyle}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          userSelect: 'none',
        }}
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
      </View>
    </FocusRing>
  );
}
