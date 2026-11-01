import { useAppTheme } from '@/hooks/useAppTheme';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

type Props = React.ComponentPropsWithRef<typeof View> & {
  children: React.ReactNode;
};

const CardActions = ({ children, style, ...rest }: Props) => {
  const { colors, colorScheme } = useAppTheme();
  const containerStyle = [
    styles.container,
    { borderTopColor: colorScheme === 'dark' ? colors.outline : colors.outlineVariant },
    style,
  ];

  return (
    <View style={containerStyle} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
    justifyContent: 'flex-end',
    borderTopWidth: 1,
  },
});

export default CardActions;
