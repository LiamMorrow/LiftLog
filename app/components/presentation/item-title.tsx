import { Text, TextStyle } from 'react-native';
import { useAppTheme, font } from '@/hooks/useAppTheme';

interface ItemTitleProps {
  title: string;
  style?: TextStyle;
}

export default function ItemTitle({ title, style }: ItemTitleProps) {
  const { colors } = useAppTheme();

  return (
    <Text
      style={[
        {
          ...font['text-xl'],
          fontWeight: 'bold',
          flexShrink: 1,
          minWidth: 0,
          textAlign: 'left',
          color: colors.onSurface,
        },
        style,
      ]}
    >
      {title}
    </Text>
  );
}
