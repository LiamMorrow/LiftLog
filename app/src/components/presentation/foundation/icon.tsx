import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import { Icon as NativeIcon } from 'react-native-paper';

type IconProps = Parameters<typeof NativeIcon>[0];
type ICProps = {
  source: AppIconSource;
} & Omit<IconProps, 'source'>;

export default function Icon({ ...rest }: ICProps & { mirrored?: boolean }) {
  return <NativeIcon {...rest} />;
}
