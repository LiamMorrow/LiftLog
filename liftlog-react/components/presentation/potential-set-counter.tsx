import { PotentialSet } from '@/models/session-models';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { TouchableRipple } from 'react-native-paper';
import { Text, Touchable, useAnimatedValue, Animated } from 'react-native';
import WeightFormat from '@/components/presentation/weight-format';
import WeightDialog from '@/components/presentation/weight-dialog';
import { useAppTheme } from '@/hooks/useAppTheme';
import { PressableProps } from 'react-native-paper/lib/typescript/components/TouchableRipple/Pressable';
import FocusRing from '@/components/presentation/focus-ring';

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
  const holdingScale = useAnimatedValue(1);
  const showWeightAnimatedValue = useAnimatedValue(props.showWeight ? 1 : 0);
  const [isHolding, setIsHolding] = useState(false);
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const repCountValue = props.set?.set?.repsCompleted;

  useEffect(() => {
    Animated.timing(showWeightAnimatedValue, {
      toValue: props.showWeight ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [props.showWeight, showWeightAnimatedValue]);

  useEffect(() => {
    Animated.timing(holdingScale, {
      toValue: isHolding ? 1.1 : 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
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
    <FocusRing isSelected={props.toStartNext} radius={15}>
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
            borderBottomLeftRadius: showWeightAnimatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [10, 0],
            }),
            borderBottomRightRadius: showWeightAnimatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [10, 0],
            }),
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
            height: showWeightAnimatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, spacing[9]],
            }),
            width: showWeightAnimatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, spacing[14]],
            }),
            padding: showWeightAnimatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, spacing[2]],
            }),
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
            <Text style={{ color: colors.onSurface }}>
              <WeightFormat weight={props.set.weight} suffixClass="" />
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
