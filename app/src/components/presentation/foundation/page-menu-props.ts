import { MenuItem } from '@/components/presentation/foundation/menu-props';
import { ReactNode } from 'react';

export interface PageMenuProps {
  /** Shown behind the header's overflow affordance, with their labels. */
  items: MenuItem[];
  /**
   * Buttons sitting inline in the header, before the overflow affordance. Each platform declares
   * its header as a whole, so these are platform native nodes: `Stack.Toolbar` children on iOS,
   * anything the header renders (an `Appbar.Action`, say) on Android.
   */
  actions?: ReactNode;
  /** Identifies the overflow affordance itself, not the menu it opens. */
  testID?: string;
}
