import { I18nManager, ImageSourcePropType, Platform, ViewStyle } from 'react-native';
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
  /** The glyph size on Android. iOS scales it down to match SF Symbols' larger optical size. */
  iconSize?: number;
  colors?: { content?: string; container?: string };
  mirrored?: boolean;
  disabled?: boolean;
  testID?: string;
}

const minimumTouchSize = Platform.select({ ios: 44, default: 48 });

export const defaultIconSize = 24;

export function nativeIconButtonSize(iconSize = defaultIconSize) {
  return Math.max(minimumTouchSize, iconSize + 16);
}

export function nativeIconButtonHostStyle(props: Pick<NativeIconButtonProps, 'iconSize' | 'mirrored'>): ViewStyle {
  const size = nativeIconButtonSize(props.iconSize);
  return {
    width: size,
    height: size,
    transform: props.mirrored && I18nManager.isRTL ? [{ scaleX: -1 }] : undefined,
  };
}
