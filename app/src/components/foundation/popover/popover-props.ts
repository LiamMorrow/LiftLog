import { ReactNode } from 'react';

export interface PopoverProps {
  /** What the popover points at. */
  trigger: (open: () => void) => ReactNode;
  children: (close: () => void) => ReactNode;
  accessibilityLabel: string;
  width?: number;
}
