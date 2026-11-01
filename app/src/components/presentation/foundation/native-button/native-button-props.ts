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

/** A leading icon is given for both platforms or not at all. */
type NativeButtonIcon =
  | {
      /** Android only: an XML vector drawable, e.g. `@expo/material-symbols/edit.xml`. */
      icon: ImageSourcePropType;
      /** iOS only. */
      systemImage: SFSymbol;
    }
  | { icon?: undefined; systemImage?: undefined };

export type NativeButtonProps = NativeButtonIcon & {
  label: string;
  onPress: () => void;
  variant?: NativeButtonVariant;
  disabled?: boolean;
  /** Shows a spinner in place of the icon and disables the button. */
  loading?: boolean;
  /** Tighter padding, for toolbars and other cramped spots. */
  compact?: boolean;
  /** The label colour, for buttons drawn on a surface other than the page's. */
  contentColor?: string;
  testID?: string;
  /** Sizes the host the button is drawn into, not the button itself. */
  style?: StyleProp<ViewStyle>;
};
