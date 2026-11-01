import { TextStyle } from 'react-native';
import { ColorChoice } from '@/hooks/useAppTheme';
import { AppText } from '@/components/presentation/foundation/app-text';

interface ItemTitleProps {
  title: string;
  style?: TextStyle;
  testID?: string;
  color?: ColorChoice;
}

export default function ItemTitle({ title, style, testID, color = 'onSurface' }: ItemTitleProps) {
  return (
    <AppText variant="titleLarge" color={color} style={[{ flexShrink: 1, minWidth: 0 }, style]} testID={testID}>
      {title}
    </AppText>
  );
}
