import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { View, ViewProps } from 'react-native';
import { Icon } from 'react-native-paper';
import { msIconSource } from './ms-icon-source';

export default function EmptyInfo(props: ViewProps & { icon?: string }) {
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
      <Icon source={props.icon ?? msIconSource('info')} size={20} />
      <SurfaceText color="onSurface" style={{ textAlign: 'center' }}>
        {props.children}
      </SurfaceText>
    </View>
  );
}
