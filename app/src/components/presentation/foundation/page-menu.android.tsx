import Menu from '@/components/presentation/foundation/menu';
import { PageMenuProps } from '@/components/presentation/foundation/page-menu-props';
import { Stack } from 'expo-router';
import { Appbar } from 'react-native-paper';

export default function PageMenu({ items, actions, testID }: PageMenuProps) {
  return (
    <Stack.Screen
      options={{
        headerRight: () => (
          <>
            {actions}
            <Menu trigger={(open) => <Appbar.Action testID={testID} icon="moreVert" onPress={open} />} items={items} />
          </>
        ),
      }}
    />
  );
}
