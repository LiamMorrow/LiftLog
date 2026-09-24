import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ColorChoice } from '@/hooks/useAppTheme';
import { Rest } from '@/models/blueprint-models';
import { Duration, OffsetDateTime } from '@js-joda/core';
import { ViewStyle } from 'react-native';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { RestTimerControls } from '@/components/presentation/workout/rest-timer-controls';
import { formatTimeSpan, TimerPane, TimerSegment } from '@/components/presentation/workout/timer-pane';
import { useTranslate } from '@tolgee/react';

interface RestTimerProps {
  rest: Rest;
  startTime: OffsetDateTime;
  pausedAt: OffsetDateTime | undefined;
  failed: boolean;
  style?: ViewStyle;
  onRestart: () => void;
  onDismiss: () => void;
  onTogglePause: () => void;
}

type RestPhase = 'resting' | 'ready' | 'over';

const phaseColor: Record<RestPhase, ColorChoice> = {
  resting: 'onSurfaceVariant',
  ready: 'green',
  over: 'orange',
};

export default function RestTimer({
  rest,
  startTime,
  pausedAt,
  failed,
  style,
  onRestart,
  onDismiss,
  onTogglePause,
}: RestTimerProps) {
  const { t } = useTranslate();
  const paused = pausedAt !== undefined;
  const jiggled = useRef(new Set<string>());

  const getTimerState = useCallback(() => {
    const now = pausedAt ?? OffsetDateTime.now();
    const elapsed = Duration.between(startTime, now).toMillis();
    // A failed set earns a single, longer rest, and a fixed rest has min === max. Both are a
    // target rather than a window, so they have no second segment to fill.
    const windowStart = (failed ? rest.failureRest : rest.minRest).toMillis();
    const windowEnd = failed || rest.minRest.equals(rest.maxRest) ? undefined : rest.maxRest.toMillis();

    if (elapsed < windowStart) {
      return {
        phase: 'resting' as const,
        windowStart,
        windowEnd,
        remaining: formatTimeSpan(windowStart - elapsed),
        restProgress: elapsed / windowStart,
        windowProgress: 0,
      };
    }
    if (windowEnd !== undefined && elapsed < windowEnd) {
      return {
        phase: 'ready' as const,
        windowStart,
        windowEnd,
        remaining: formatTimeSpan(windowEnd - elapsed),
        restProgress: 1,
        windowProgress: (elapsed - windowStart) / (windowEnd - windowStart),
      };
    }
    return {
      phase: 'over' as const,
      windowStart,
      windowEnd,
      remaining: `+${formatTimeSpan(elapsed - (windowEnd ?? windowStart))}`,
      restProgress: 1,
      windowProgress: 1,
    };
  }, [startTime, pausedAt, rest, failed]);

  const [timerState, setTimerState] = useState(getTimerState());
  const [jiggling, setJiggling] = useState(false);

  const triggerJiggle = useCallback(
    (milestone: string) => {
      if (jiggled.current.has(milestone)) return;
      jiggled.current.add(milestone);
      impactAsync(ImpactFeedbackStyle.Heavy).catch(console.log);
      setJiggling(true);
      setTimeout(() => setJiggling(false), 10);
    },
    [jiggled],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const state = getTimerState();
      setTimerState(state);
      // An edit can move an elapsed deadline back into the future. Rearm only those
      // milestones, so the longer rest alerts again without replaying past alerts.
      if (state.phase === 'resting') jiggled.current.delete('ready');
      if (state.phase !== 'over') jiggled.current.delete('over');
      if (paused) return;
      if (state.phase !== 'resting') triggerJiggle('ready');
      if (state.phase === 'over') triggerJiggle('over');
    }, 200);
    return () => clearInterval(timer);
  }, [getTimerState, triggerJiggle, paused]);

  const { phase, windowStart, windowEnd } = timerState;
  const accent = phaseColor[phase];

  const status = paused
    ? t('rest_timer.status.paused')
    : phase === 'resting'
      ? t('rest_timer.status.resting')
      : phase === 'ready'
        ? t('rest_timer.status.ready')
        : t('rest_timer.status.over');

  const segments: TimerSegment[] = [
    {
      flex: windowStart,
      progress: timerState.restProgress,
      color: phase === 'over' && windowEnd === undefined ? phaseColor['over'] : phaseColor['resting'],
    },
    ...(windowEnd !== undefined
      ? [
          {
            flex: windowEnd - windowStart,
            progress: timerState.windowProgress,
            color: phaseColor[phase],
          },
        ]
      : []),
  ];

  return (
    <TimerPane
      testID="rest-timer"
      time={timerState.remaining}
      status={status}
      accent={accent}
      segments={segments}
      jiggling={jiggling}
      style={style}
      controls={
        <RestTimerControls
          paused={paused}
          onRestart={() => {
            onRestart();
            jiggled.current.clear();
            triggerJiggle('reset');
          }}
          onTogglePause={onTogglePause}
          onDismiss={onDismiss}
        />
      }
    />
  );
}
