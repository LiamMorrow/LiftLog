import { PotentialSet } from '@/models/session-models';
import { formatRepsTarget, Resistance, RepsTarget } from '@/models/blueprint-models';
import { ReactNode, useEffect } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, useAnimatedValue, View } from 'react-native';
import WeightFormat from '@/components/presentation/foundation/weight-format';
import { rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { AppText } from '@/components/presentation/foundation/app-text';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { Icon } from '@/components/presentation/foundation/icon';
import { match } from 'ts-pattern';

interface PotentialSetDisplayProps {
  set: PotentialSet;
  repsTarget: RepsTarget;
  resistance: Resistance;
  previousRepCount?: number | undefined;

  /** Omit to render a static tile - a tile with no handler mounts no gesture detector at all. */
  onPressReps?: () => void;
  onPressWeight?: () => void;
  isNext?: boolean;
}

/**
 * The two-tone set tile, without any of the editor's interactivity. Handlers are optional so a read-only
 * list can render many of these without paying for a `TouchableRipple` -- and its gesture detector -- per
 * tile.
 */
export function PotentialSetDisplay(props: PotentialSetDisplayProps) {
  const { colors } = useAppTheme();
  const repCountValue = props.set.set?.repsCompleted;
  const isFilled = repCountValue !== undefined;
  const showsWeight = props.resistance !== 'none';
  const isNext = !isFilled && !!props.isNext;
  const isLater = !isFilled && !props.isNext;
  const setColors = match({ isFilled, isNext: !!props.isNext })
    .returnType<{ background: string; text: string }>()
    .with({ isFilled: true }, () => ({ background: colors.primary, text: colors.onPrimary }))
    .with({ isNext: true }, () => ({ background: colors.secondaryContainer, text: colors.onSecondaryContainer }))
    .with({}, () => ({ background: colors.surfaceContainerHighest, text: colors.onSurfaceVariant + '99' }))
    .exhaustive();
  const weightBackground = isLater ? colors.surfaceContainerHigh : colors.secondaryContainer + 'AA';

  return (
    <View
      style={{
        userSelect: 'none',
        minWidth: spacing[15],
        gap: 2,
      }}
    >
      <View
        style={{
          borderRadius: rounding.roundedRectangleRadius,
          // The weight row closes the tile off when there is one.
          borderBottomLeftRadius: showsWeight ? rounding.segmentedBetweenRadius : rounding.roundedRectangleRadius,
          borderBottomRightRadius: showsWeight ? rounding.segmentedBetweenRadius : rounding.roundedRectangleRadius,
          overflow: 'hidden',
        }}
      >
        {isNext ? <NextSetPulse /> : undefined}
        <Pressable
          onPress={props.onPressReps}
          testID="repcount"
          style={{
            flexShrink: 0,
            height: spacing[15],
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isNext ? 'transparent' : setColors.background,
            paddingHorizontal: spacing[2],
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <AppText variant="titleLarge" style={{ color: setColors.text }}>
              <Text style={{ fontWeight: isFilled ? 'bold' : undefined }}>{repCountValue ?? '-'}</Text>
              <AppText variant="bodyLarge" style={{ color: setColors.text, verticalAlign: 'top' }}>
                /{formatRepsTarget(props.repsTarget)}
              </AppText>
            </AppText>
            {props.previousRepCount !== undefined && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[0.5] }}>
                <Icon source={'history'} size={12} color={setColors.text} />
                <Text style={{ color: setColors.text }}>{props.previousRepCount}</Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>
      {showsWeight && (
        <View
          style={{
            backgroundColor: weightBackground,
            borderTopLeftRadius: rounding.segmentedBetweenRadius,
            borderTopRightRadius: rounding.segmentedBetweenRadius,
            borderBottomLeftRadius: rounding.roundedRectangleRadius,
            borderBottomRightRadius: rounding.roundedRectangleRadius,
            overflow: 'hidden',
            padding: spacing[2],
            width: '100%',
          }}
        >
          <Pressable
            onPress={props.onPressWeight}
            testID="repcount-weight"
            style={{
              alignItems: 'center',
              margin: -spacing[2],
              padding: spacing[2],
            }}
          >
            <WeightFormat
              variant="bodyMedium"
              weight={props.set.weight}
              usesBodyweight={props.resistance === 'bodyweight'}
            />
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Pressable(props: { onPress: (() => void) | undefined; style: object; testID: string; children: ReactNode }) {
  if (!props.onPress) {
    return (
      <View style={props.style} testID={props.testID}>
        {props.children}
      </View>
    );
  }
  return (
    <TouchableRipple style={props.style} onPress={props.onPress} testID={props.testID}>
      {props.children}
    </TouchableRipple>
  );
}

const pulseStrength = 0.35;

function NextSetPulse() {
  const { colors } = useAppTheme();
  const strength = useAnimatedValue(0);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence(
        [pulseStrength, 0].map((toValue) =>
          Animated.timing(strength, {
            toValue,
            duration: 1200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ),
      ),
    );
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!cancelled && !reduceMotion) {
        pulse.start();
      }
    });
    return () => {
      cancelled = true;
      pulse.stop();
    };
  }, [strength]);

  const backgroundColor = strength.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.secondaryContainer, colors.primary],
  });

  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor }]} />;
}
