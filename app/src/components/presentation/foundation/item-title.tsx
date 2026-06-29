import { Text, TextStyle } from 'react-native';
import { useAppTheme, font, ColorChoice } from '@/hooks/useAppTheme';

interface ItemTitleProps {
  title: string;
  style?: TextStyle;
  testID?: string;
  color?: ColorChoice;
}

export default function ItemTitle({ title, style, testID, color = 'onSurface' }: ItemTitleProps) {
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
          color: colors[color],
        },
        style,
      ]}
      testID={testID}
    >
      {title}
    </Text>
  );
}
