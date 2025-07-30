import {
  ColorChoice,
  font,
  FontChoice,
  useAppTheme,
} from '@/hooks/useAppTheme';
import { Text, TextProps, TextStyle } from 'react-native';

interface SurfaceTextProps extends TextProps {
  color?: ColorChoice;
  font?: FontChoice;
  weight?: TextStyle['fontWeight'];
}

export function SurfaceText(props: SurfaceTextProps) {
  const { colors } = useAppTheme();
  const { style, weight, ...rest } = props;
  const fontChoice = props.font ?? 'text-base';
  return (
    <Text
      {...rest}
      style={[
        { color: colors[props.color ?? 'onSurface'], fontWeight: weight },
        font[fontChoice],
        style,
      ]}
    />
  );
}
