import { ImageSourcePropType } from 'react-native';
import { SFSymbol } from 'sf-symbols-typescript';

export type SegmentedPickerValue = string | number;

export interface SegmentedPickerOption<T extends SegmentedPickerValue> {
  value: T;
  label: string;
  /** Android only: an XML vector drawable, e.g. `@expo/material-symbols/timer.xml`. */
  icon?: ImageSourcePropType;
  /** iOS only. */
  systemImage?: SFSymbol;
  testID?: string;
}

export interface SegmentedPickerProps<T extends SegmentedPickerValue> {
  value: T;
  options: SegmentedPickerOption<T>[];
  onChange: (value: T) => void;
  enabled?: boolean;
  /**
   * Android only: whether the toggle buttons stretch to equal widths that fill the row. When
   * false they size to their content instead. iOS segments are always equal width.
   * @default true
   */
  equalWidth?: boolean;
}
