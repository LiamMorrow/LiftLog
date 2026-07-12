import { ReactNode } from 'react';
import { ImageSourcePropType } from 'react-native';
import { SFSymbol } from 'sf-symbols-typescript';

export interface PageAction {
  label: string;
  onPress: () => void;
  /** Android only: an XML vector drawable, e.g. `@expo/material-symbols/add.xml`. */
  icon: ImageSourcePropType;
  /** iOS only. */
  systemImage: SFSymbol;
  testID?: string;
}

/**
 * How the page's primary action behaves, which decides how each platform draws it.
 * - `surface`: a recurring action on a page you return to (Material gives this a FAB).
 * - `commit`: the final action of a flow, after which the page is left behind (a filled button).
 */
export type PrimaryActionKind = 'surface' | 'commit';

export interface PageActionsProps {
  primary: PageAction;
  secondary?: PageAction[];
  primaryKind?: PrimaryActionKind;
  /**
   * Floats above the actions, spanning the full width so that it reads the same whether the
   * platform centres its actions or anchors them to a corner.
   */
  accessory?: ReactNode;
}
