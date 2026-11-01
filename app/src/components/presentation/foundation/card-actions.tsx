import * as React from 'react';
import { StyleSheet, View } from 'react-native';

type Props = React.ComponentPropsWithRef<typeof View> & {
  children: React.ReactNode;
};

const CardActions = ({ children, style, ...rest }: Props) => {
  const containerStyle = [styles.container, style];

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
  },
});

export default CardActions;
