import { AppIconSource, MsIconSrc } from '@/components/presentation/foundation/ms-icon-source';
import { useAppTheme } from '@/hooks/useAppTheme';
import { I18nManager, View } from 'react-native';

interface IconProps {
  source: AppIconSource;
  size: number;
  color?: string;
  mirrored?: boolean;
  testID?: string;
}

export function Icon({ source, size, color, mirrored, testID }: IconProps) {
  const { colors } = useAppTheme();
  const icon =
    typeof source === 'function' ? (
      source()
    ) : (
      <MsIconSrc name={source} size={size} color={color ?? colors.onSurface} testID={testID} />
    );
  if (mirrored && I18nManager.isRTL) {
    return <View style={{ transform: [{ scaleX: -1 }] }}>{icon}</View>;
  }
  return icon;
}
