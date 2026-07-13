import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import TouchableRipple from '@/components/presentation/foundation/gesture-wrappers/touchable-ripple';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useMountEffect } from '@/hooks/useMountEffect';
import { ActivityCell } from '@/store/activity';
import { useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { levelColor, markerColor } from '@/components/presentation/calendar/activity-colors';

const CELL_SIZE = spacing[10];
const MARKER_SIZE = 5;

interface ActivityDayCellProps {
  cell: ActivityCell;
  isSelected: boolean;
  entranceDelayMs: number;
  onPress?: (cell: ActivityCell) => void;
}

export function ActivityDayCell({ cell, isSelected, entranceDelayMs, onPress }: ActivityDayCellProps) {
  const { colors, colorScheme } = useAppTheme();
  const formatDate = useFormatDate();

  const anim = useRef(new Animated.Value(0)).current;

  useMountEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 150,
      delay: entranceDelayMs,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  });

  const { background, foreground } = levelColor(cell.level, colors, colorScheme === 'dark');
  const isEmpty = cell.level === 0;
  const outlineToday = cell.isToday && isEmpty;

  const hasMarkers = cell.markers.length > 0 || cell.overflowMarkers > 0;

  return (
    <Animated.View
      style={{
        flex: 1,
        alignItems: 'center',
        opacity: cell.isOutsideFocus ? Animated.multiply(anim, 0.4) : anim,
        transform: [{ scale: anim }],
      }}
    >
      <TouchableRipple
        onPress={onPress && !cell.isFuture ? () => onPress(cell) : undefined}
        disabled={cell.isFuture}
        style={{ padding: spacing[1], borderRadius: 1000, overflow: 'hidden' }}
      >
        <View style={{ alignItems: 'center', gap: spacing[1] }}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              aspectRatio: 1,
              width: CELL_SIZE,
              borderRadius: 1000,
              backgroundColor: background,
              borderColor: isSelected ? colors.primary : outlineToday ? colors.outline : 'transparent',
              borderWidth: isSelected ? 2 : 1,
            }}
          >
            <SurfaceText style={[{ textAlign: 'center' }, isEmpty ? undefined : { color: foreground }]}>
              {formatDate(cell.date, { day: 'numeric' })}
            </SurfaceText>

            {cell.sessionCount > 1 && (
              <View
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: MARKER_SIZE,
                  height: MARKER_SIZE,
                  borderRadius: 1000,
                  backgroundColor: colors.tertiary,
                }}
              />
            )}
          </View>

          {/* Beyond the feed horizon we render no marker row at all -- an empty one would claim, falsely,
              that nobody trained, when in truth their events have simply expired. */}
          {!cell.isBeyondFeedHorizon && (
            <View style={{ flexDirection: 'row', gap: 2, height: MARKER_SIZE }}>
              {hasMarkers &&
                cell.markers.map((marker) => (
                  <View
                    key={marker.userId}
                    style={{
                      width: MARKER_SIZE,
                      height: MARKER_SIZE,
                      borderRadius: 1000,
                      backgroundColor: markerColor(marker.userId, colors),
                    }}
                  />
                ))}
              {cell.overflowMarkers > 0 && (
                <SurfaceText font="text-xs" color="onSurfaceVariant" style={{ lineHeight: MARKER_SIZE }}>
                  {`+${cell.overflowMarkers}`}
                </SurfaceText>
              )}
            </View>
          )}
        </View>
      </TouchableRipple>
    </Animated.View>
  );
}
