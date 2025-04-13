import { spacing } from '@/hooks/useAppTheme';
import { Key, ReactNode } from 'react';
import { View, ViewProps } from 'react-native';
import { Card, CardProps } from 'react-native-paper';

interface CardListProps<T> extends ViewProps {
  items: readonly T[];
  renderItem: (item: T) => ReactNode;
  onPress?: (item: T) => void;
  onLongPress?: (item: T) => void;
  shouldHighlight?: (item: T) => boolean;
  cardStyle?: CardProps['style'];
  cardType: CardProps['mode'];
  keySelector?: (item: T) => Key;
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
    ...rest
  } = props;
  return (
    <View
      {...rest}
      style={[
        {
          gap: spacing[2],
          padding: spacing[2],
        },
        rest['style'],
      ]}
    >
      {items.map((item, i) => (
        <Card
          key={keySelector?.(item) ?? i}
          style={[
            cardStyle,
            shouldHighlight?.(item) ? highlightStyle : undefined,
          ]}
          mode={cardType}
          onLongPress={onLongPress ? () => onLongPress(item) : undefined}
          onPress={onPress ? () => onPress(item) : undefined}
        >
          <Card.Content>{renderItem(item)}</Card.Content>
        </Card>
      ))}
    </View>
  );
}

const highlightStyle = {};
