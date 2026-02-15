import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useBottomSheetScrollableCreator } from '@gorhom/bottom-sheet';
import { LegendList } from '@legendapp/list';
import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Card } from 'react-native-paper';
import { match } from 'ts-pattern';

export function SegmentedList<T>(props: {
  renderItem: (item: T, index: number) => ReactNode;
  onItemPress?: (item: T) => void;
  itemKey?: (item: T, index: number) => string;
  items: T[];
  scrollable?: boolean;
  isInBottomSheet?: boolean;
  renderScrollComponent?: ScrollView;
  style?: ViewStyle;
}) {
  const BottomSheetScrollable = useBottomSheetScrollableCreator();
  const itemKey = props.itemKey ?? ((_, index) => index.toString());
  const onItemPress = props.onItemPress;
  if (!props.scrollable) {
    return (
      <View style={[{ gap: spacing[0.5] }, props.style]}>
        {props.items.map((item, index) => (
          <SegmentedListItem
            key={itemKey(item, index)}
            isFirst={index === 0}
            isLast={index === props.items.length - 1}
            onPress={onItemPress ? () => onItemPress(item) : undefined}
          >
            {props.renderItem(item, index)}
          </SegmentedListItem>
        ))}
      </View>
    );
  }
  return (
    <LegendList
      contentContainerStyle={[props.style]}
      ItemSeparatorComponent={() => (
        <View style={{ height: spacing[0.5] }}></View>
      )}
      data={props.items}
      renderScrollComponent={
        props.isInBottomSheet ? BottomSheetScrollable : undefined!
      }
      keyExtractor={itemKey}
      renderItem={({ item, index }) => (
        <SegmentedListItem
          key={itemKey(item, index)}
          isFirst={index === 0}
          isLast={index === props.items.length - 1}
          onPress={onItemPress ? () => onItemPress(item) : undefined}
        >
          {props.renderItem(item, index)}
        </SegmentedListItem>
      )}
    />
  );
}

function SegmentedListItem(props: {
  isFirst: boolean;
  isLast: boolean;
  children: ReactNode;
  onPress: undefined | (() => void);
}) {
  const { colors } = useAppTheme();
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
    <Card
      mode="elevated"
      elevation={0}
      style={[{ backgroundColor: colors.surfaceContainer }, style]}
      onPress={props.onPress}
    >
      <Card.Content>{props.children}</Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  onlyItem: {},
  firstItem: {
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  middleItem: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  lastItem: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});
