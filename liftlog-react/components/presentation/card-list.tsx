import { spacing } from '@/hooks/useAppTheme';
import { Key, ReactNode } from 'react';
import { View, ViewProps } from 'react-native';
import { Card, CardProps } from 'react-native-paper';

interface CardListProps<T> extends ViewProps {
  items: readonly T[];
  renderItem: (item: T, index: number) => ReactNode;
  onPress?: (item: T, index: number) => void;
  onLongPress?: (item: T, index: number) => void;
  shouldHighlight?: (item: T, index: number) => boolean;
  cardStyle?: CardProps['style'];
  cardType: 'elevated' | 'outlined' | 'contained';
  keySelector?: (item: T) => Key;
  emptyTemplate?: ReactNode;
}

export default function CardList<T>(props: CardListProps<T>) {
  const {
    items,
    renderItem,
    onPress,
    onLongPress,
    shouldHighlight,
    cardStyle,
    cardType,
    keySelector,
    emptyTemplate,
    ...rest
  } = props;
  return (
    <View
      {...rest}
      style={[
        {
          gap: spacing[2],
          padding: spacing[2],
          flex: 1,
        },
        rest['style'],
      ]}
    >
      {!!items.length || emptyTemplate}
      {items.map((item, i) => (
        <Card
          key={keySelector?.(item) ?? i}
          style={[
            cardStyle,
            shouldHighlight?.(item, i) ? highlightStyle : undefined,
          ]}
          mode={cardType}
          onLongPress={onLongPress ? () => onLongPress(item, i) : undefined}
          onPress={onPress ? () => onPress(item, i) : undefined}
        >
          <Card.Content>{renderItem(item, i)}</Card.Content>
        </Card>
      ))}
    </View>
  );
}

const highlightStyle = {};
