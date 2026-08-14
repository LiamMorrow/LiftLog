import { usePreferredWeightSuffix, usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
import { Weight } from '@/models/weight';

/**
 * How a chart turns one axis's quantity into a number to plot and a string to show beside it.
 */
export interface QuantityAxis<T> {
  /** The value to plot, in whatever unit this axis displays. */
  toNumber(value: T): number;
  /** How the quantity reads on its own, for a bar top or a stat tile. */
  format(value: T): string;
  /** How an already-plotted number reads, on a focused tooltip. */
  formatNumber(value: number): string;
}

export function useLoadAxis(): QuantityAxis<Weight> {
  const unit = usePreferredWeightUnit();
  const suffix = usePreferredWeightSuffix();
  return {
    toNumber: (value) => value.convertTo(unit).value.toNumber(),
    format: (value) => value.shortLocaleFormat(0),
    formatNumber: (value) => `${value.toFixed(0)}${suffix}`,
  };
}

/** Reps have no unit, so every label is the bare count. */
export function useRepsAxis(): QuantityAxis<number> {
  return {
    toNumber: (value) => value,
    format: (value) => value.toFixed(0),
    formatNumber: (value) => value.toFixed(0),
  };
}
