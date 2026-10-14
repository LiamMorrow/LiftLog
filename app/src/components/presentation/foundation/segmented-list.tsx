import Icon from '@/components/presentation/foundation/icon';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import { rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { LegendList } from '@legendapp/list';
import { Children, isValidElement, ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { match } from 'ts-pattern';
type TupleKeysNum<T extends readonly unknown[]> = Exclude<Partial<T>['length'], T['length']>;

type SegmentedListProps<TItems extends readonly unknown[]> = {
  itemKey?: (item: TItems[number], index: TupleKeysNum<TItems>) => string;
  items: TItems;
  scrollable?: boolean;
  style?: ViewStyle;
} & (TItems[number] extends ReactNode
  ? { renderItem?: (item: TItems[number], index: TupleKeysNum<TItems>) => ReactNode }
  : { renderItem: (item: TItems[number], index: TupleKeysNum<TItems>) => ReactNode });

export function SegmentedList<TItems extends readonly unknown[]>(props: SegmentedListProps<TItems>) {
  const itemKey = props.itemKey ?? ((_, index) => String(index));
  const renderItem =
    (props as { renderItem?: (item: TItems[number], index: TupleKeysNum<TItems>) => ReactNode }).renderItem ??
    ((item: TItems[number]) => item as ReactNode);
  if (!props.scrollable) {
    return (
      <View style={[{ gap: spacing[0.5] }, props.style]}>
        {props.items.map((item, index) => (
          <SegmentedListItem
            key={itemKey(item, index as TupleKeysNum<TItems>)}
            isFirst={index === 0}
            isLast={index === props.items.length - 1}
          >
            {renderItem(item, index as TupleKeysNum<TItems>)}
          </SegmentedListItem>
        ))}
      </View>
    );
  }
  return (
    <LegendList
      contentContainerStyle={[props.style]}
      ItemSeparatorComponent={() => <View style={{ height: spacing[0.5] }}></View>}
      data={props.items}
      keyExtractor={(i, index) => itemKey(i, index as TupleKeysNum<TItems>)}
      renderItem={({ item, index }) => (
        <SegmentedListItem
          key={itemKey(item, index as TupleKeysNum<TItems>)}
          isFirst={index === 0}
          isLast={index === props.items.length - 1}
        >
          {renderItem(item, index as TupleKeysNum<TItems>)}
        </SegmentedListItem>
      )}
    />
  );
}

export function SegmentedGroup(props: { children: ReactNode; style?: ViewStyle }) {
  const items = Children.toArray(props.children);
  return (
    <View style={[{ gap: spacing[0.5] }, props.style]}>
      {items.map((child, index) => (
        <SegmentedListItem
          key={isValidElement(child) && child.key !== null ? child.key : index}
          isFirst={index === 0}
          isLast={index === items.length - 1}
        >
          {child}
        </SegmentedListItem>
      ))}
    </View>
  );
}

export function SegmentListFormElement(props: {
  label: ReactNode;
  icon?: AppIconSource;
  onPress?: () => void;
  onLongPress?: () => void;
  supportingText?: ReactNode;
  line2?: ReactNode | string;
  right?: ReactNode | string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useAppTheme();
  const pressable = props.onPress ?? props.onLongPress;
  const Wrapper = pressable ? TouchableRipple : View;
  return (
    <Wrapper onPress={props.onPress} onLongPress={props.onLongPress}>
      <View style={[{ padding: spacing[4] }, props.style]}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              gap: spacing[2],
              alignItems: 'center',
            }}
          >
            {props.icon ? <Icon size={20} source={props.icon} /> : undefined}
            <Text variant="labelLarge">{props.label}</Text>
          </View>
          {typeof props.right === 'string' ? <Text variant="labelLarge">{props.right}</Text> : props.right}
        </View>
        {props.supportingText ? (
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginBlockStart: spacing[2] }}>
            {props.supportingText}
          </Text>
        ) : undefined}
        {props.line2}
      </View>
    </Wrapper>
  );
}

export function SegmentedListRowAction(props: { children: ReactNode }) {
  return <View style={styles.rowAction}>{props.children}</View>;
}

function SegmentedListItem(props: { isFirst: boolean; isLast: boolean; children: ReactNode }) {
  const style = match(props)
    .with(
      {
        isFirst: true,
        isLast: true,
      },
      () => styles.onlyItem,
    )
    .with({ isFirst: true }, () => styles.firstItem)
    .with({ isLast: true }, () => styles.lastItem)
    .with({ isFirst: false, isLast: false }, () => styles.middleItem)
    .exhaustive();
  return (
    <Card mode="contained" style={[style, { padding: 0, overflow: 'hidden' }]}>
      {props.children}
    </Card>
  );
}

const styles = StyleSheet.create({
  rowAction: {
    marginBlock: -spacing[4],
    marginInlineEnd: -spacing[4],
  },
  onlyItem: {},
  firstItem: {
    borderBottomLeftRadius: rounding.segmentedBetweenRadius,
    borderBottomRightRadius: rounding.segmentedBetweenRadius,
  },
  middleItem: {
    borderTopLeftRadius: rounding.segmentedBetweenRadius,
    borderTopRightRadius: rounding.segmentedBetweenRadius,
    borderBottomLeftRadius: rounding.segmentedBetweenRadius,
    borderBottomRightRadius: rounding.segmentedBetweenRadius,
  },
  lastItem: {
    borderTopLeftRadius: rounding.segmentedBetweenRadius,
    borderTopRightRadius: rounding.segmentedBetweenRadius,
  },
});
