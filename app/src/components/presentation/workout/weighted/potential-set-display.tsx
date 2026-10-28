import { PotentialSet } from '@/models/session-models';
import { formatRepsTarget, Resistance, RepsTarget } from '@/models/blueprint-models';
import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import WeightFormat from '@/components/presentation/foundation/weight-format';
import { font, rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import Icon from '@/components/presentation/foundation/icon';
import { match } from 'ts-pattern';

interface PotentialSetDisplayProps {
  set: PotentialSet;
  repsTarget: RepsTarget;
  resistance: Resistance;
  previousRepCount?: number | undefined;

  /** Omit to render a static tile - a tile with no handler mounts no gesture detector at all. */
  onPressReps?: () => void;
  onPressWeight?: () => void;
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
  const setColors = match({ isFilled })
    .returnType<{ background: string; text: string }>()
    .with({ isFilled: true }, () => ({ background: colors.primary, text: colors.onPrimary }))
    .with({}, () => ({ background: colors.secondaryContainer, text: colors.onSecondaryContainer + '99' }))
    .exhaustive();

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
            <Text
              style={{
                color: setColors.text,
                ...font['text-xl'],
              }}
            >
              <Text style={{ fontWeight: isFilled ? 'bold' : undefined }}>{repCountValue ?? '-'}</Text>
              <Text style={{ ...font['text-base'], verticalAlign: 'top' }}>/{formatRepsTarget(props.repsTarget)}</Text>
            </Text>
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
            backgroundColor: colors.secondaryContainer + 'AA',
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
            <Text style={{ color: colors.onSecondaryContainer, ...font['text-sm'] }}>
              <WeightFormat weight={props.set.weight} usesBodyweight={props.resistance === 'bodyweight'} />
            </Text>
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
