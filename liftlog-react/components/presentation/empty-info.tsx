import { useAppTheme, spacing } from '@/hooks/useAppTheme';
import { Text, View, ViewProps } from 'react-native';
import { Icon } from 'react-native-paper';

export default function EmptyInfo(props: ViewProps & { icon?: string }) {
  const { colors } = useAppTheme();
  const { icon, style, ...rest } = props;
  return (
    <View
      {...rest}
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: spacing[4],
        },
        style,
      ]}
    >
      <Icon source={props.icon ?? 'info'} size={20} />
      <Text style={{ color: colors.onSurface }}>{props.children}</Text>
    </View>
  );
}
