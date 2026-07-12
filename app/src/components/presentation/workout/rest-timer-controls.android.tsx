import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import {
  RestTimerControlsProps,
  restControlIconSize,
} from '@/components/presentation/workout/rest-timer-controls-props';
import { FilledIconToggleButton, Host, Icon, IconButton, Row } from '@expo/ui/jetpack-compose';
import { useTranslate } from '@tolgee/react';
import RestartIcon from '@expo/material-symbols/replay.xml';
import PauseIcon from '@expo/material-symbols/pause.xml';
import ResumeIcon from '@expo/material-symbols/play_arrow.xml';
import DismissIcon from '@expo/material-symbols/close.xml';

export function RestTimerControls({ paused, onRestart, onTogglePause, onDismiss }: RestTimerControlsProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();

  return (
    <Host matchContents seedColor={colors.seedColor}>
      <Row horizontalArrangement={{ spacedBy: spacing[1] }} verticalAlignment="center">
        <IconButton onClick={onRestart}>
          <Icon
            source={RestartIcon}
            size={restControlIconSize}
            tint={colors.onSurfaceVariant}
            contentDescription={t('rest_timer.restart')}
          />
        </IconButton>
        {/* Pausing is a state, not an action, so it gets the control Material has for state: the
            checked container carries "this timer is stopped" alongside the glyph. */}
        <FilledIconToggleButton checked={paused} onCheckedChange={onTogglePause}>
          <Icon
            source={paused ? ResumeIcon : PauseIcon}
            size={restControlIconSize + 3}
            contentDescription={paused ? t('rest_timer.resume') : t('rest_timer.pause')}
          />
        </FilledIconToggleButton>
        <IconButton onClick={onDismiss}>
          <Icon
            source={DismissIcon}
            size={restControlIconSize}
            tint={colors.onSurfaceVariant}
            contentDescription={t('rest_timer.dismiss')}
          />
        </IconButton>
      </Row>
    </Host>
  );
}
