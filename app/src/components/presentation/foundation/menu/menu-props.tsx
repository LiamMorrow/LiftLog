import { NativeIconButtonProps } from '@/components/presentation/foundation/native-icon-button';
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

export type MenuTrigger = Pick<
  NativeIconButtonProps,
  'icon' | 'systemImage' | 'label' | 'variant' | 'colors' | 'testID'
>;

export interface MenuProps {
  trigger: MenuTrigger;
  items: MenuItem[];
}
