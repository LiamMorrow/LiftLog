import { AppText } from '@/components/presentation/foundation/app-text';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { spacing } from '@/hooks/useAppTheme';
import { StyleProp, View, ViewStyle } from 'react-native';

export function ListItem(props: {
  title: string;
  description?: string;
  descriptionNumberOfLines?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const content = (
    <View
      style={[
        { paddingVertical: spacing[2], paddingInlineStart: spacing[4], paddingInlineEnd: spacing[6], minHeight: 56 },
        { justifyContent: 'center' },
        props.style,
      ]}
    >
      <AppText variant="bodyLarge">{props.title}</AppText>
      {props.description !== undefined ? (
        <AppText variant="bodyMedium" color="onSurfaceVariant" numberOfLines={props.descriptionNumberOfLines}>
          {props.description}
        </AppText>
      ) : undefined}
    </View>
  );
  if (!props.onPress) {
    return <View testID={props.testID}>{content}</View>;
  }
  return (
    <TouchableRipple testID={props.testID} onPress={props.onPress}>
      {content}
    </TouchableRipple>
  );
}
