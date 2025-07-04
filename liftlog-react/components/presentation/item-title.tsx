import { Text } from 'react-native';
import { useAppTheme, font } from '@/hooks/useAppTheme';

interface ItemTitleProps {
  title: string;
}

export default function ItemTitle({ title }: ItemTitleProps) {
  const { colors } = useAppTheme();

  return (
    <Text
      style={{
        ...font['text-xl'],
        fontWeight: 'bold',
        flexShrink: 1,
        minWidth: 0,
        textAlign: 'left',
        color: colors.onSurface,
      }}
    >
      {title}
    </Text>
  );
}
