import { spacing } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { FlatGrid } from 'react-native-super-grid';

export function SingleValueStatisticsGrid(props: { children: ReactNode[] }) {
  const gridSpacing = spacing[2];
  return (
    <FlatGrid
      scrollEnabled={false}
      data={props.children}
      spacing={gridSpacing}
      maxItemsPerRow={2}
      style={{ marginHorizontal: -gridSpacing }}
      renderItem={({ item }) => (
        <View
          style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}
        >
          {item}
        </View>
      )}
    />
  );
}
