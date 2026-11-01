import { ReactNode } from 'react';
import { ImageSourcePropType } from 'react-native';
import { SFSymbol } from 'sf-symbols-typescript';

export interface MenuItem {
  label: string;
  onPress: () => void;
  icon?: ImageSourcePropType;
  systemImage?: SFSymbol;
  destructive?: boolean;
  disabled?: boolean;
}

export interface MenuProps {
  trigger: (open: () => void) => ReactNode;
  items: MenuItem[];
  testID?: string;
  /** iOS only: the trigger's whole touch box. Without it, the trigger is 40 with a 6 margin. */
  size?: number;
}
