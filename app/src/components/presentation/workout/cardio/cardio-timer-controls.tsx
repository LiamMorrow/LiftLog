import { InlineHost } from '@/components/presentation/foundation/inline-host';
import { spacing } from '@/hooks/useAppTheme';
import {
  CardioTimerControlsProps,
  cardioControlIconSize,
} from '@/components/presentation/workout/cardio/cardio-timer-controls-props';
import { Button, HStack, Image } from '@expo/ui/swift-ui';
import { accessibilityLabel, frame, padding } from '@expo/ui/swift-ui/modifiers';
import { glassButtonStyle } from '@/components/presentation/foundation/glass-button-style';
import { useTranslate } from '@tolgee/react';

const controlPadding = padding({ horizontal: spacing[1], vertical: spacing[1] });
const iconFrame = frame({ width: cardioControlIconSize, height: cardioControlIconSize });

export function CardioTimerControls({ onStop }: CardioTimerControlsProps) {
  const { t } = useTranslate();

  return (
    <InlineHost matchContents>
      <HStack alignment="center">
        <Button
          onPress={onStop}
          modifiers={[glassButtonStyle('prominent'), controlPadding, accessibilityLabel(t('cardio_timer.stop'))]}
        >
          <Image systemName="stop.fill" size={cardioControlIconSize} modifiers={[iconFrame]} />
        </Button>
      </HStack>
    </InlineHost>
  );
}
