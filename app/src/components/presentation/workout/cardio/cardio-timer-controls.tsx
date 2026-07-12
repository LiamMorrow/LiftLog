import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import {
  CardioTimerControlsProps,
  cardioControlIconSize,
} from '@/components/presentation/workout/cardio/cardio-timer-controls-props';
import { Button, HStack, Host, Image } from '@expo/ui/swift-ui';
import { accessibilityLabel, buttonStyle, frame, padding } from '@expo/ui/swift-ui/modifiers';
import { useTranslate } from '@tolgee/react';

const controlPadding = padding({ horizontal: spacing[1], vertical: spacing[1] });
const iconFrame = frame({ width: cardioControlIconSize, height: cardioControlIconSize });

export function CardioTimerControls({ onStop }: CardioTimerControlsProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();

  return (
    <Host matchContents seedColor={colors.seedColor}>
      <HStack alignment="center">
        <Button
          onPress={onStop}
          modifiers={[buttonStyle('glassProminent'), controlPadding, accessibilityLabel(t('cardio_timer.stop'))]}
        >
          <Image systemName="stop.fill" size={cardioControlIconSize} modifiers={[iconFrame]} />
        </Button>
      </HStack>
    </Host>
  );
}
