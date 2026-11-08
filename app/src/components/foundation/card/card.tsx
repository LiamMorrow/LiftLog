import TouchableRipple from '@/components/foundation/touchable-ripple';
import { rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

interface CardProps {
  children: ReactNode;
  actions?: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  testID?: string;
}

export function Card({ children, actions, style, onPress, testID }: CardProps) {
  const { colors } = useAppTheme();
  return (
    <View testID={testID} style={[{ backgroundColor: colors.surfaceVariant }, styles.card, style]}>
      {onPress ? <TouchableRipple onPress={onPress}>{children}</TouchableRipple> : children}
      {actions ? <View style={styles.actions}>{actions}</View> : undefined}
    </View>
  );
}

export function CardContent({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[{ padding: spacing[4] }, style]} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: rounding.cardRadius,
    overflow: 'hidden',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    gap: spacing[2],
  },
});
