import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import { ReactNode } from 'react';
import { SFSymbol } from 'sf-symbols-typescript';

export interface MenuItem {
  label: string;
  onPress: () => void;
  icon?: AppIconSource;
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
