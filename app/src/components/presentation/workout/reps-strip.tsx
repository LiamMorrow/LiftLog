import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { StyleProp, View, ViewStyle } from 'react-native';

export type RepsStripSet = { label: string; isDone: boolean };

export function RepsStrip(props: { sets: RepsStripSet[]; compact?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[0.5] }, props.style]}>
      {props.sets.map((set, index) => (
        <RepsSegment
          key={index}
          set={set}
          compact={props.compact}
          isFirst={index === 0}
          isLast={index === props.sets.length - 1}
        />
      ))}
    </View>
  );
}

function RepsSegment(props: { set: RepsStripSet; compact?: boolean; isFirst: boolean; isLast: boolean }) {
  const { colors } = useAppTheme();
  const { set } = props;
  const size = props.compact ? spacing[6] : spacing[8];
  const startRadius = props.isFirst ? rounding.roundedRectangleRadius : rounding.segmentedBetweenRadius;
  const endRadius = props.isLast ? rounding.roundedRectangleRadius : rounding.segmentedBetweenRadius;
  return (
    <View
      style={{
        minWidth: size,
        height: size,
        paddingHorizontal: spacing[1],
        borderTopLeftRadius: startRadius,
        borderBottomLeftRadius: startRadius,
        borderTopRightRadius: endRadius,
        borderBottomRightRadius: endRadius,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: set.isDone ? colors.primary : colors.surface,
      }}
    >
      <SurfaceText
        font={props.compact ? 'text-sm' : 'text-base'}
        weight={set.isDone ? 'bold' : undefined}
        color={set.isDone ? 'onPrimary' : 'onSurfaceVariant'}
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {set.label}
      </SurfaceText>
    </View>
  );
}
