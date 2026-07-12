import { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import { SFSymbol } from 'sf-symbols-typescript';

/**
 * Emphasis of a button, drawn with each platform's own control for that emphasis rather than a
 * shared approximation.
 * - `filled`: the one action a screen is for.
 * - `tonal`: a secondary action that still wants a surface.
 * - `outlined`: a secondary action alongside a filled one.
 * - `text`: the quietest option, for actions that shouldn't compete.
 */
export type NativeButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text';

export interface NativeButtonProps {
  label: string;
  onPress: () => void;
  variant?: NativeButtonVariant;
  /** Android only: an XML vector drawable, e.g. `@expo/material-symbols/edit.xml`. */
  icon?: ImageSourcePropType;
  /** iOS only. */
  systemImage?: SFSymbol;
  disabled?: boolean;
  /** Sizes the host the button is drawn into, not the button itself. */
  style?: StyleProp<ViewStyle>;
}
