import { defaultIconSize, NativeIconButtonProps, NativeIconButtonVariant } from './native-icon-button-props';
import { AppThemeColors } from '@/hooks/useAppTheme';
import { Image } from '@expo/ui/swift-ui';
import { buttonBorderShape, buttonStyle, contentShape, frame, shapes, tint } from '@expo/ui/swift-ui/modifiers';

const styleForVariant: Record<NativeIconButtonVariant, Parameters<typeof buttonStyle>[0]> = {
  standard: 'plain',
  filled: 'borderedProminent',
  tonal: 'bordered',
  outlined: 'bordered',
};

type SwiftIconButtonProps = Pick<NativeIconButtonProps, 'systemImage' | 'variant' | 'iconSize' | 'colors'>;

export function swiftIconButtonModifiers(props: SwiftIconButtonProps, theme: AppThemeColors) {
  return [
    buttonStyle(styleForVariant[props.variant ?? 'standard']),
    buttonBorderShape('circle'),
    tint(props.colors?.container ?? theme.primary),
  ];
}

export function SwiftIconButtonImage({
  boxSize,
  theme,
  ...props
}: SwiftIconButtonProps & { boxSize: number; theme: AppThemeColors }) {
  const iconSize = props.iconSize ?? defaultIconSize;
  const standard = (props.variant ?? 'standard') === 'standard';
  const contentColor = props.colors?.content ?? (standard ? theme.onSurfaceVariant : undefined);
  const frameSize = standard ? boxSize : iconSize;
  return (
    <Image
      systemName={props.systemImage}
      size={Math.round((iconSize * 5) / 6)}
      color={contentColor}
      modifiers={[frame({ width: frameSize, height: frameSize }), contentShape(shapes.circle())]}
    />
  );
}
