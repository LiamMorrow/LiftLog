import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import {
  CardioTimerControlsProps,
  cardioControlIconSize,
} from '@/components/presentation/workout/cardio/cardio-timer-controls-props';
import { Host, Icon, IconButton, Row } from '@expo/ui/jetpack-compose';
import { useTranslate } from '@tolgee/react';
import StopIcon from '@expo/material-symbols/stop.xml';

export function CardioTimerControls({ onStop }: CardioTimerControlsProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();

  return (
    <Host matchContents seedColor={colors.seedColor}>
      <Row horizontalArrangement={{ spacedBy: spacing[1] }} verticalAlignment="center">
        <IconButton onClick={onStop}>
          <Icon source={StopIcon} size={cardioControlIconSize + 3} contentDescription={t('cardio_timer.stop')} />
        </IconButton>
      </Row>
    </Host>
  );
}
