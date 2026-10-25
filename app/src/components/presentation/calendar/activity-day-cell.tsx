import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { ActivityCell } from '@/store/activity';
import { memo } from 'react';
import { View } from 'react-native';
import { levelColor } from '@/components/presentation/calendar/activity-colors';
import FocusRing from '@/components/presentation/foundation/focus-ring';

const TILE_HEIGHT = 40;
const TILE_RADIUS = 14;
const SELECTED_RING_PADDING = 3;

interface ActivityDayCellProps {
  cell: ActivityCell;
  isSelected: boolean;
  onPress?: (cell: ActivityCell) => void;
}

export const ActivityDayCell = memo(function ActivityDayCell({ cell, isSelected, onPress }: ActivityDayCellProps) {
  const { colors } = useAppTheme();
  const formatDate = useFormatDate();

  const { background, foreground } = levelColor(cell.level, colors);
  const isEmpty = cell.level === 0;
  const outlineToday = cell.isToday && isEmpty;
  const emptyBackground = cell.isFuture ? 'transparent' : colors.surfaceContainer;
  const emptyForeground = cell.isFuture ? colors.outline : colors.onSurfaceVariant;

  return (
    <FocusRing
      isSelected={isSelected}
      padding={SELECTED_RING_PADDING}
      radius={TILE_RADIUS + SELECTED_RING_PADDING}
      pointerEvents="none"
      style={{
        flex: 1,
        height: TILE_HEIGHT,
        borderRadius: TILE_RADIUS,
        opacity: cell.isOutsideFocus ? 0.4 : 1,
      }}
    >
      <TouchableRipple
        onPress={onPress && !cell.isFuture ? () => onPress(cell) : undefined}
        disabled={cell.isFuture}
        style={{ flex: 1, borderRadius: TILE_RADIUS, overflow: 'hidden' }}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: TILE_RADIUS,
            backgroundColor: isEmpty ? emptyBackground : background,
            borderColor: outlineToday ? colors.onSurface : 'transparent',
            borderWidth: 1.5,
          }}
        >
          <SurfaceText
            font="text-sm"
            weight={cell.isToday ? 'bold' : undefined}
            style={{ color: isEmpty ? (outlineToday ? colors.onSurface : emptyForeground) : foreground }}
          >
            {formatDate(cell.date, { day: 'numeric' })}
          </SurfaceText>
        </View>
      </TouchableRipple>
    </FocusRing>
  );
});
