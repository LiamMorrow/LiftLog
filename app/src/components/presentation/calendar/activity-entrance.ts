import { Animated } from 'react-native';

export interface CellEntrance {
  opacity: Animated.AnimatedInterpolation<number>;
  scale: Animated.AnimatedInterpolation<number>;
}

/** The share of the grid's entrance that has played by the time the last cell starts moving. */
const STAGGER_SPAN = 0.5;

/**
 * Every cell reads its entrance out of one animated value owned by the grid, rather than owning a timer of
 * its own. Forty-two independent animations is enough work to drop frames on the commit that swaps month.
 */
export function cellEntrance(progress: Animated.Value, index: number, total: number): CellEntrance {
  const start = total <= 1 ? 0 : (index / total) * STAGGER_SPAN;
  const end = start + (1 - STAGGER_SPAN);

  return {
    opacity: progress.interpolate({
      inputRange: [start, end],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
    scale: progress.interpolate({
      inputRange: [start, (start + end) / 2, end],
      outputRange: [0.4, 1.06, 1],
      extrapolate: 'clamp',
    }),
  };
}
