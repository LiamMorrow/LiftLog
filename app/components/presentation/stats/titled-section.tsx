import { spacing } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';

export function TitledSection(props: {
  title: string;
  style?: ViewStyle;
  titleRight?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View
      style={[
        {
          marginHorizontal: spacing.pageHorizontalMargin,
        },
        props.style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text variant="titleMedium" style={{ marginBottom: spacing[2] }}>
          {props.title}
        </Text>
        {props.titleRight}
      </View>
      {props.children}
    </View>
  );
}
