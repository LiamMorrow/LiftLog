import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { View, ViewProps } from 'react-native';
import Icon from '@/components/presentation/foundation/icon';
import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';

export default function EmptyInfo(props: ViewProps & { icon?: AppIconSource }) {
  const { icon, style, ...rest } = props;
  return (
    <View
      {...rest}
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing[4],
          gap: spacing[4],
        },
        style,
      ]}
    >
      <Icon source={icon ?? 'info'} size={30} />
      <SurfaceText color="onSurface" style={{ textAlign: 'center' }}>
        {props.children}
      </SurfaceText>
    </View>
  );
}
