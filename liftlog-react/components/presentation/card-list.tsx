import { spacing } from '@/hooks/useAppTheme';
import { Key, ReactElement, ReactNode } from 'react';
import { View, ViewProps } from 'react-native';
import { Card, CardProps } from 'react-native-paper';

interface CardListProps<T> extends ViewProps {
  items: readonly T[];
  renderItemContent: (item: T, index: number) => ReactElement;
  renderItemActions?: (item: T, index: number) => ReactElement;
  renderItemTitle?: (item: T, index: number) => ReactElement;

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
    renderItemContent,
    renderItemActions,
    renderItemTitle,
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
          flex: 1,
        },
        rest['style'],
      ]}
    >
      {!!items.length || emptyTemplate}
      {items.map((item, i) => {
        const title = renderItemTitle && {
          ...renderItemTitle(item, i),
          key: 'title',
        };
        const content = { ...renderItemContent(item, i), key: 'content' };
        const actions = renderItemActions && {
          ...renderItemActions(item, i),
          key: 'actions',
        };
        return (
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
            {[title, content, actions].filter(Boolean)}
          </Card>
        );
      })}
    </View>
  );
}

const highlightStyle = {};
