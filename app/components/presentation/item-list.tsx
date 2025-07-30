import { spacing } from '@/hooks/useAppTheme';
import { Fragment, ReactNode } from 'react';
import { View, ViewProps } from 'react-native';
import { Divider } from 'react-native-paper';

export default function ItemList<T>(
  props: {
    items: readonly T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    verticalPadding?: boolean;
    empty?: ReactNode;
  } & ViewProps,
) {
  const { items, renderItem, verticalPadding, ...rest } = props;
  if (!items.length && props.empty) {
    return props.empty;
  }

  return (
    <View
      {...rest}
      style={[
        { paddingVertical: (verticalPadding ?? true) ? spacing[2] : 0 },
        rest.style,
      ]}
      testID="item-list"
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
