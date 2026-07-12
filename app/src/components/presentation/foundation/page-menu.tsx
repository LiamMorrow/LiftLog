import { PageMenuProps } from '@/components/presentation/foundation/page-menu-props';
import { Stack } from 'expo-router';

export default function PageMenu({ items, actions }: PageMenuProps) {
  return (
    <Stack.Toolbar placement="right">
      {actions}
      <Stack.Toolbar.Menu>
        <Stack.Toolbar.Icon sf="ellipsis.circle" />
        {items.map((item) => (
          <Stack.Toolbar.MenuAction key={item.label} onPress={item.onPress} icon={item.systemImage}>
            {item.label}
          </Stack.Toolbar.MenuAction>
        ))}
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}
