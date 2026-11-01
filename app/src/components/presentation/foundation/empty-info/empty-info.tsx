import { AppText } from '@/components/presentation/foundation/app-text';
import { spacing } from '@/hooks/useAppTheme';
import { ImageSourcePropType, View, ViewProps } from 'react-native';
import { NativeIcon } from '@/components/presentation/foundation/native-icon';
import InfoIcon from '@expo/material-symbols/info.xml';
import { SFSymbol } from 'sf-symbols-typescript';

/** An icon is given for both platforms or not at all. */
type EmptyInfoIcon =
  | { icon: ImageSourcePropType; systemImage: SFSymbol }
  | { icon?: undefined; systemImage?: undefined };

export default function EmptyInfo(props: ViewProps & EmptyInfoIcon) {
  const { icon, systemImage, style, ...rest } = props;
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
      <NativeIcon icon={icon ?? InfoIcon} systemImage={systemImage ?? 'info.circle'} size={30} />
      <AppText variant="bodyLarge" color="onSurface" style={{ textAlign: 'center' }}>
        {props.children}
      </AppText>
    </View>
  );
}
