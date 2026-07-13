import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import TouchableRipple from '@/components/presentation/foundation/gesture-wrappers/touchable-ripple';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { ActivityCell } from '@/store/activity';
import { memo } from 'react';
import { Animated, View } from 'react-native';
import { levelColor, markerColor } from '@/components/presentation/calendar/activity-colors';
import { CellEntrance } from '@/components/presentation/calendar/activity-entrance';

const MARKER_SIZE = 4;
/** Tall enough for the "+N" glyph, which is what sets the row's height -- not the dots. */
const MARKER_ROW_HEIGHT = 10;
/** Once a "+N" is in the row there's only room for two dots beside it. */
const MAX_VISIBLE_MARKERS_WITH_COUNT = 2;

interface ActivityDayCellProps {
  cell: ActivityCell;
  isSelected: boolean;
  entrance: CellEntrance;
  onPress?: (cell: ActivityCell) => void;
}

export const ActivityDayCell = memo(function ActivityDayCell({
  cell,
  isSelected,
  entrance,
  onPress,
}: ActivityDayCellProps) {
  const { colors } = useAppTheme();
  const formatDate = useFormatDate();

  const { background, foreground } = levelColor(cell.level, colors);
  const isEmpty = cell.level === 0;
  const outlineToday = cell.isToday && isEmpty;

  // Beyond the feed horizon we render no marker slot at all -- an empty one would claim, falsely, that
  // nobody trained, when in truth their events have simply expired.
  const showMarkers = !cell.isBeyondFeedHorizon && (cell.markers.length > 0 || cell.overflowMarkers > 0);

  // The row has to fit across a chord of the circle, which is a good deal narrower than the cell. A count
  // costs about as much width as two dots, so it takes their place rather than being added beside them.
  const hasOverflow = cell.overflowMarkers > 0;
  const visibleMarkers = hasOverflow ? cell.markers.slice(0, MAX_VISIBLE_MARKERS_WITH_COUNT) : cell.markers;
  const overflowCount = cell.overflowMarkers + (cell.markers.length - visibleMarkers.length);

  return (
    <Animated.View
      style={{
        flex: 1,
        aspectRatio: 1,
        opacity: cell.isOutsideFocus ? Animated.multiply(entrance.opacity, 0.4) : entrance.opacity,
        transform: [{ scale: entrance.scale }],
      }}
    >
      <TouchableRipple
        onPress={onPress && !cell.isFuture ? () => onPress(cell) : undefined}
        disabled={cell.isFuture}
        style={{ flex: 1, borderRadius: 1000, overflow: 'hidden' }}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            borderRadius: 1000,
            backgroundColor: background,
            borderColor: isSelected ? colors.primary : outlineToday ? colors.outline : 'transparent',
            borderWidth: isSelected ? 2 : 1,
          }}
        >
          <SurfaceText font="text-sm" style={isEmpty ? undefined : { color: foreground }}>
            {formatDate(cell.date, { day: 'numeric' })}
          </SurfaceText>

          {showMarkers && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, height: MARKER_ROW_HEIGHT }}>
              {visibleMarkers.map((marker) => (
                <View
                  key={marker.userId + marker.eventId}
                  style={{
                    width: MARKER_SIZE,
                    height: MARKER_SIZE,
                    borderRadius: 1000,
                    backgroundColor: markerColor(marker.userId, colors),
                  }}
                />
              ))}
              {hasOverflow && (
                <SurfaceText
                  font="text-2xs"
                  numberOfLines={1}
                  style={{
                    fontSize: 9,
                    lineHeight: MARKER_ROW_HEIGHT,
                    color: isEmpty ? colors.onSurfaceVariant : foreground,
                  }}
                >
                  {`+${overflowCount}`}
                </SurfaceText>
              )}
            </View>
          )}
        </View>
      </TouchableRipple>
    </Animated.View>
  );
});
