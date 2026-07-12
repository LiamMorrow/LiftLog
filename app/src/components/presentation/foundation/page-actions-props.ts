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
   * Whether the primary action shows its label next to the icon, or shrinks to the icon alone.
   * Collapse it to give the page (or the accessory) back the room the label takes.
   * Only a `surface` primary can collapse: a `commit` button is a page's last word and needs
   * its label, and a primary sharing a toolbar with secondary actions is already icon-only.
   *
   * Leaving this unset means the page never collapses, which iOS also reads as licence to centre
   * its actions; passing it anchors them to the trailing edge so the collapse can't move them.
   */
  primaryExpanded?: boolean;
  /**
   * Floats above the actions, spanning the full width so that it reads the same whether the
   * platform centres its actions or anchors them to a corner.
   */
  accessory?: ReactNode;
}
