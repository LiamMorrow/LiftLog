import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import { Fragment } from 'react';
import { View, ViewProps } from 'react-native';
import { Divider } from 'react-native-paper';

export default function ItemList<T>(
  props: {
    items: readonly T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    verticalPadding?: boolean;
  } & ViewProps,
) {
  const { colors } = useAppTheme();
  const { items, renderItem, verticalPadding, ...rest } = props;

  return (
    <View
      {...rest}
      style={[
        { paddingVertical: verticalPadding ? spacing[2] : 0 },
        rest.style,
      ]}
      data-cy="item-list"
    >
      {items.map((item, index) => (
        <Fragment key={index}>
          <View>{renderItem(item, index)}</View>
          {items.length - 1 !== index && <Divider style={{}} />}
        </Fragment>
      ))}
    </View>
  );
}
