import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import { SFSymbol } from 'sf-symbols-typescript';

export interface PageAction {
  label: string;
  onPress: () => void;
  icon: AppIconSource;
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
}
