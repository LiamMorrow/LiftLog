import { Text } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

interface ItemTitleProps {
  title: string;
}

export default function ItemTitle({ title }: ItemTitleProps) {
  const { colors, font } = useAppTheme();

  return (
    <Text
      style={{
        ...font['text-xl'],
        fontWeight: 'bold',
        flexShrink: 1,
        overflow: 'hidden',
        minWidth: 0,
        textAlign: 'left',
        color: colors.onSurface,
      }}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {title}
    </Text>
  );
}
