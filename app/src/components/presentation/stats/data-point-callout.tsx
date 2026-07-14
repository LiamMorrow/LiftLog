import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export function DataPointCallout(props: { label: string; value: string }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        paddingVertical: spacing[1],
        backgroundColor: colors.surface,
        borderRadius: 4,
        borderColor: colors.outline,
        borderStyle: 'solid',
        borderWidth: 1,
      }}
    >
      <Text>{props.label}</Text>
      <Text>{props.value}</Text>
    </View>
  );
}
