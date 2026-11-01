import { Card } from '@/components/presentation/foundation/card';
import { spacing } from '@/hooks/useAppTheme';
import { Key, ReactElement, ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

interface CardListProps<T> extends ViewProps {
  items: readonly T[];
  renderItemContent: (item: T, index: number) => ReactElement;
  renderItemActions?: (item: T, index: number) => ReactElement;
  keySelector?: (item: T) => Key;
  emptyTemplate?: ReactNode;
}

export default function CardList<T>(props: CardListProps<T>) {
  const { items, renderItemContent, renderItemActions, keySelector, emptyTemplate, ...rest } = props;
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
      {items.map((item, i) => (
        <Card key={keySelector?.(item) ?? i}>
          {renderItemContent(item, i)}
          {renderItemActions?.(item, i)}
        </Card>
      ))}
    </View>
  );
}
