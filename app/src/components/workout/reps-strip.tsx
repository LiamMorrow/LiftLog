import { AppText } from '@/components/foundation/app-text';
import TouchableRipple from '@/components/foundation/touchable-ripple';
import { rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

export type RepsStripSet = { label: string; isDone: boolean };

export interface RepsSegmentCorners {
  topStart: boolean;
  topEnd: boolean;
  bottomEnd: boolean;
  bottomStart: boolean;
}

export function RepsStrip(props: { sets: RepsStripSet[]; compact?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[0.5] }, props.style]}>
      {props.sets.map((set, index) => {
        const isFirst = index === 0;
        const isLast = index === props.sets.length - 1;
        return (
          <RepsSegment
            key={index}
            set={set}
            compact={props.compact}
            roundedCorners={{ topStart: isFirst, bottomStart: isFirst, topEnd: isLast, bottomEnd: isLast }}
          />
        );
      })}
    </View>
  );
}

export function RepsSegment(props: {
  set: RepsStripSet;
  roundedCorners: RepsSegmentCorners;
  compact?: boolean;
  highlighted?: boolean;
  onPress?: () => void;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useAppTheme();
  const { set, roundedCorners } = props;
  const radius = (rounded: boolean) => (rounded ? rounding.roundedRectangleRadius : rounding.segmentedBetweenRadius);
  const highlighted = props.highlighted && !set.isDone;
  const content = (
    <AppText
      variant={props.compact ? (set.isDone ? 'labelLarge' : 'bodyMedium') : set.isDone ? 'titleMedium' : 'bodyLarge'}
      color={set.isDone ? 'onPrimary' : highlighted ? 'primary' : 'onSurfaceVariant'}
      style={{ fontVariant: ['tabular-nums'] }}
    >
      {set.label}
    </AppText>
  );
  const centered: ViewStyle = { flex: 1, alignItems: 'center', justifyContent: 'center' };
  const corners: ViewStyle = {
    borderTopStartRadius: radius(roundedCorners.topStart),
    borderTopEndRadius: radius(roundedCorners.topEnd),
    borderBottomEndRadius: radius(roundedCorners.bottomEnd),
    borderBottomStartRadius: radius(roundedCorners.bottomStart),
  };
  return (
    <View
      style={[
        corners,
        {
          minWidth: props.compact ? spacing[6] + spacing[0.5] : spacing[8],
          height: props.compact ? spacing[6] : spacing[8],
          paddingHorizontal: props.onPress ? 0 : spacing[1],
          overflow: 'hidden',
          backgroundColor: set.isDone ? colors.primary : colors.surface,
        },
        props.style,
      ]}
    >
      {props.onPress ? (
        <TouchableRipple
          testID={props.testID}
          accessibilityRole="button"
          accessibilityState={{ selected: set.isDone }}
          onPress={props.onPress}
          style={centered}
        >
          {content}
        </TouchableRipple>
      ) : (
        <View style={centered}>{content}</View>
      )}
      {highlighted ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, corners, { borderWidth: 2, borderColor: colors.primary }]}
        />
      ) : undefined}
    </View>
  );
}
