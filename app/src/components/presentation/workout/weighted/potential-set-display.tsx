import { PotentialSet } from '@/models/session-models';
import { formatRepsTarget, RepsTarget } from '@/models/blueprint-models';
import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import WeightFormat from '@/components/presentation/foundation/weight-format';
import { font, rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import Icon from '@/components/presentation/foundation/icon';

export type PotentialSetSize = 'default' | 'compact';

interface PotentialSetDisplayProps {
  set: PotentialSet;
  repsTarget: RepsTarget;
  usesBodyweight: boolean;
  previousRepCount?: number | undefined;
  size?: PotentialSetSize;

  /** Omit to render a static tile - a tile with no handler mounts no gesture detector at all. */
  onPressReps?: () => void;
  onPressWeight?: () => void;
}

const metrics = {
  default: {
    repsHeight: spacing[15],
    minWidth: spacing[15],
    maxWidth: undefined,
    repsFont: font['text-xl'],
    targetFont: font['text-sm'],
    weightFont: font['text-sm'],
    weightPadding: spacing[2],
  },
  compact: {
    repsHeight: spacing[9],
    minWidth: spacing[11],
    maxWidth: spacing[16],
    repsFont: font['text-lg'],
    targetFont: font['text-xs'],
    weightFont: font['text-xs'],
    weightPadding: spacing[1],
  },
} as const;

/**
 * The two-tone set tile, without any of the editor's interactivity. Handlers are optional so a read-only
 * list can render many of these without paying for a `TouchableRipple` -- and its gesture detector -- per
 * tile.
 */
export function PotentialSetDisplay(props: PotentialSetDisplayProps) {
  const { colors } = useAppTheme();
  const size = metrics[props.size ?? 'default'];
  const repCountValue = props.set.set?.repsCompleted;
  const isFilled = repCountValue !== undefined;

  return (
    <View
      style={{
        userSelect: 'none',
        minWidth: size.minWidth,
        maxWidth: size.maxWidth,
        flexGrow: size.maxWidth === undefined ? undefined : 1,
        flexBasis: size.maxWidth === undefined ? undefined : size.minWidth,
      }}
    >
      <View
        style={{
          borderTopLeftRadius: rounding.roundedRectangleRadius,
          borderTopRightRadius: rounding.roundedRectangleRadius,
          overflow: 'hidden',
        }}
      >
        <Pressable
          onPress={props.onPressReps}
          testID="repcount"
          style={{
            flexShrink: 0,
            height: size.repsHeight,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isFilled ? colors.primary : colors.secondaryContainer,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                color: isFilled ? colors.onPrimary : colors.onSecondaryContainer,
                ...size.repsFont,
              }}
            >
              <Text style={{ fontWeight: 'bold' }}>{repCountValue ?? '-'}</Text>
              <Text style={{ ...size.targetFont, verticalAlign: 'top' }}>/{formatRepsTarget(props.repsTarget)}</Text>
            </Text>
            {!isFilled && props.previousRepCount !== undefined && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[0.5] }}>
                <Icon source={'history'} size={12} color={colors.onSecondaryContainer + '99'} />
                <Text style={{ color: colors.onSecondaryContainer + '99' }}>{props.previousRepCount}</Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>
      <View
        style={{
          borderTopWidth: 1,
          borderColor: colors.outline,
          backgroundColor: colors.surfaceContainerHigh,
          borderBottomLeftRadius: rounding.roundedRectangleRadius,
          borderBottomRightRadius: rounding.roundedRectangleRadius,
          overflow: 'hidden',
          padding: size.weightPadding,
          width: '100%',
        }}
      >
        <Pressable
          onPress={props.onPressWeight}
          testID="repcount-weight"
          style={{
            alignItems: 'center',
            margin: -size.weightPadding,
            padding: size.weightPadding,
          }}
        >
          <Text style={{ color: colors.onSurface, ...size.weightFont }}>
            <WeightFormat weight={props.set.weight} usesBodyweight={props.usesBodyweight} />
          </Text>
        </Pressable>
      </View>
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
