import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import {
  RestTimerControlsProps,
  restControlIconSize,
} from '@/components/presentation/workout/rest-timer-controls-props';
import { Button, HStack, Host, Image } from '@expo/ui/swift-ui';
import { accessibilityLabel, buttonStyle, frame, padding } from '@expo/ui/swift-ui/modifiers';
import { useTranslate } from '@tolgee/react';

// A button hugs its label, so without padding the puck shrink-wraps the glyph and the controls run
// together.
const controlPadding = padding({ horizontal: spacing[2], vertical: spacing[2] });

// SF Symbols have different intrinsic widths at the same point size, so a button hugging the glyph
// alone lets `arrow.counterclockwise` outgrow `xmark`. Squaring off the icon keeps the pucks equal.
const iconFrame = frame({ width: restControlIconSize, height: restControlIconSize });

export function RestTimerControls({ paused, onRestart, onTogglePause, onDismiss }: RestTimerControlsProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();

  return (
    <Host matchContents seedColor={colors.seedColor}>
      <HStack spacing={spacing[1]} alignment="center">
        <Button
          onPress={onRestart}
          modifiers={[buttonStyle('glass'), controlPadding, accessibilityLabel(t('rest_timer.restart'))]}
        >
          <Image systemName="arrow.counterclockwise" size={restControlIconSize} modifiers={[iconFrame]} />
        </Button>
        <Button
          onPress={onTogglePause}
          modifiers={[
            buttonStyle('glassProminent'),
            controlPadding,
            accessibilityLabel(paused ? t('rest_timer.resume') : t('rest_timer.pause')),
          ]}
        >
          <Image systemName={paused ? 'play.fill' : 'pause.fill'} size={restControlIconSize} modifiers={[iconFrame]} />
        </Button>
        <Button
          onPress={onDismiss}
          modifiers={[buttonStyle('glass'), controlPadding, accessibilityLabel(t('rest_timer.dismiss'))]}
        >
          <Image systemName="xmark" size={restControlIconSize} modifiers={[iconFrame]} />
        </Button>
      </HStack>
    </Host>
  );
}
