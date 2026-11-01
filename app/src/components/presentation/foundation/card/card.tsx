import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  testID?: string;
}

export function Card({ children, style, onPress, testID }: CardProps) {
  const { colors } = useAppTheme();
  return (
    <View
      testID={testID}
      style={[{ backgroundColor: colors.surfaceVariant, borderRadius: rounding.cardRadius, overflow: 'hidden' }, style]}
    >
      {onPress ? <TouchableRipple onPress={onPress}>{children}</TouchableRipple> : children}
    </View>
  );
}

export function CardContent({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[{ padding: spacing[4] }, style]} />;
}
