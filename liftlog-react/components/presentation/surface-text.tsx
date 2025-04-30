import {
  ColorChoice,
  font,
  FontChoice,
  useAppTheme,
} from '@/hooks/useAppTheme';
import { Text, TextProps } from 'react-native';

interface SurfaceTextProps extends TextProps {
  color?: ColorChoice;
  font?: FontChoice;
}

export function SurfaceText(props: SurfaceTextProps) {
  const { colors } = useAppTheme();
  const { style, ...rest } = props;
  let fontChoice = props.font ?? 'text-base';
  return (
    <Text
      {...rest}
      style={[
        { color: colors[props.color ?? 'onSurface'] },
        font[fontChoice],
        style,
      ]}
    />
  );
}
