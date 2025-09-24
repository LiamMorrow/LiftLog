import * as React from 'react';
import { StyleSheet, View } from 'react-native';

export type Props = React.ComponentPropsWithRef<typeof View> & {
  /**
   * Items inside the `CardActions`.
   */
  children: React.ReactNode;
};

/**
 * A component to show a list of actions inside a Card.
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { Card  } from 'react-native-paper';
import Button from '@/components/presentation/gesture-wrappers/button';
 *
 * const MyComponent = () => (
 *   <Card>
 *     <CardActions>
 *       <Button>Cancel</Button>
 *       <Button>Ok</Button>
 *     </CardActions>
 *   </Card>
 * );
 *
 * export default MyComponent;
 * ```
 */
const CardActions = ({ children, style, ...rest }: Props) => {
  const containerStyle = [styles.container, style];

  return (
    <View style={containerStyle} {...rest}>
      {children}
    </View>
  );
};

CardActions.displayName = 'Card.Actions';

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
