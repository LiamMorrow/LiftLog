import { ImageSourcePropType } from 'react-native';
import { SFSymbol } from 'sf-symbols-typescript';

export interface NativeIconProps {
  /** Android only: an XML vector drawable, e.g. `@expo/material-symbols/check.xml`. */
  icon: ImageSourcePropType;
  /** iOS only. */
  systemImage: SFSymbol;
  size: number;
  color?: string;
  mirrored?: boolean;
  accessibilityLabel?: string;
}

/** SF Symbols draw larger than Material Symbols at the same point size. */
export function sfSymbolSize(materialSize: number) {
  return Math.round((materialSize * 5) / 6);
}
