import { PageMenuProps } from './page-menu-props';
import { Stack } from 'expo-router';
import MoreHoriz from '@expo/material-symbols/more_horiz.xml';
import { Platform } from 'react-native';

export default function PageMenu({ items, actions }: PageMenuProps) {
  return (
    <Stack.Toolbar placement="right">
      {actions}
      <Stack.Toolbar.Menu>
        <Stack.Toolbar.Icon sf="ellipsis.circle" {...(Platform.OS === 'ios' ? {} : { src: MoreHoriz })} />
        {items.map((item) => (
          <Stack.Toolbar.MenuAction
            key={item.label}
            onPress={item.onPress}
            icon={Platform.OS === 'ios' ? item.systemImage : item.icon}
          >
            {item.label}
          </Stack.Toolbar.MenuAction>
        ))}
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}
