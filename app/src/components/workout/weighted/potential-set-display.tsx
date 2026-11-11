import { PotentialSet } from '@/models/session-models';
import { formatRepsTarget, Resistance, RepsTarget } from '@/models/blueprint-models';
import { ReactNode, useEffect } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, useAnimatedValue, View, ViewStyle } from 'react-native';
import WeightFormat from '@/components/foundation/weight-format';
import { rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { AppText } from '@/components/foundation/app-text';
import TouchableRipple from '@/components/foundation/touchable-ripple';
import { NativeIcon } from '@/components/foundation/native-icon';
import HistoryIcon from '@expo/material-symbols/history.xml';
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
  editing?: 'weight' | 'reps';
  weightHighlighted?: boolean;
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

  const repsShape = {
    borderRadius: rounding.roundedRectangleRadius,
    borderBottomLeftRadius: showsWeight ? rounding.segmentedBetweenRadius : rounding.roundedRectangleRadius,
    borderBottomRightRadius: showsWeight ? rounding.segmentedBetweenRadius : rounding.roundedRectangleRadius,
  };

  return (
    <View
      style={{
        userSelect: 'none',
        minWidth: spacing[15],
        gap: 2,
      }}
    >
      <View style={{ ...repsShape, overflow: 'hidden' }}>
        <Pressable
          onPress={props.onPressReps}
          testID="repcount"
          style={{
            flexShrink: 0,
            height: spacing[15],
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: setColors.background,
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
                <NativeIcon icon={HistoryIcon} systemImage="clock.arrow.circlepath" size={12} color={setColors.text} />
                <Text style={{ color: setColors.text }}>{props.previousRepCount}</Text>
              </View>
            )}
          </View>
        </Pressable>
        {isNext ? <NextSetPulse shape={repsShape} /> : undefined}
        {props.editing === 'reps' ? (
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, repsShape, { borderWidth: 2, borderColor: colors.primary }]}
          />
        ) : undefined}
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
          {(props.weightHighlighted ?? props.editing === 'weight') ? (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  borderTopLeftRadius: rounding.segmentedBetweenRadius,
                  borderTopRightRadius: rounding.segmentedBetweenRadius,
                  borderBottomLeftRadius: rounding.roundedRectangleRadius,
                  borderBottomRightRadius: rounding.roundedRectangleRadius,
                  borderWidth: 2,
                  borderColor: colors.primary,
                },
              ]}
            />
          ) : undefined}
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

function NextSetPulse(props: { shape: ViewStyle }) {
  const { colors } = useAppTheme();
  const strength = useAnimatedValue(0);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence(
        [1, 0].map((toValue) =>
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

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, props.shape, { borderWidth: 2, borderColor: colors.primary, opacity: strength }]}
    />
  );
}
