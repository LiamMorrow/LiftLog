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
  size?: number;
}
