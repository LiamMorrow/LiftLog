import { ImageSourcePropType, Platform } from 'react-native';
import { SFSymbol } from 'sf-symbols-typescript';

export type NativeIconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined';

export interface NativeIconButtonProps {
  /** Read by screen readers, and the only label the button has. */
  label: string;
  onPress: () => void;
  /** Android only: an XML vector drawable, e.g. `@expo/material-symbols/edit.xml`. */
  icon: ImageSourcePropType;
  /** iOS only. */
  systemImage: SFSymbol;
  variant?: NativeIconButtonVariant;
  disabled?: boolean;
  testID?: string;
}

export const nativeIconButtonSize = Platform.select({ ios: 44, default: 48 });

export const nativeIconButtonHostStyle = { width: nativeIconButtonSize, height: nativeIconButtonSize };
