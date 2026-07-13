import { useCallback, useEffect, useRef, useState } from 'react';
import { ColorChoice } from '@/hooks/useAppTheme';
import { matchCardioTarget } from '@/models/blueprint-models';
import { RecordedCardioExerciseSet } from '@/models/session-models';
import { OffsetDateTime } from '@js-joda/core';
import { ViewStyle } from 'react-native';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { formatTimeSpan, TimerPane, TimerSegment } from '@/components/presentation/workout/timer-pane';
import { CardioTimerControls } from '@/components/presentation/workout/cardio/cardio-timer-controls';
import { localeFormatBigNumber } from '@/utils/locale-bignumber';
import { getShortUnit, toMetres } from '@/utils/unit';
import { useTranslate } from '@tolgee/react';

interface CardioTimerProps {
  set: RecordedCardioExerciseSet;
  /** Banks the elapsed time so far without stopping, so a killed app loses at most one interval. */
  onPersist: () => void;
  onStop: () => void;
  style?: ViewStyle;
}

const persistIntervalMs = 1000;

/**
 * The clock for a running cardio set. Passing the target is the goal rather than a failure, so unlike
 * a rest it goes green and stays there rather than reddening, and it never stops itself.
 */
export function CardioTimer({ set, onPersist, onStop, style }: CardioTimerProps) {
  const { t } = useTranslate();
  const [jiggling, setJiggling] = useState(false);
  const [hasReachedTarget, setHasReachedTarget] = useState(false);

  const getTimerState = useCallback(() => {
    const elapsedMs = set.elapsedAt(OffsetDateTime.now()).toMillis();

    return matchCardioTarget(set.blueprint.target, {
      time: (target) => {
        const targetMs = target.value.toMillis();
        const reached = elapsedMs >= targetMs;
        return {
          reached,
          time: reached ? `+${formatTimeSpan(elapsedMs - targetMs)}` : formatTimeSpan(targetMs - elapsedMs),
          status: reached ? t('cardio_timer.status.over_target') : t('cardio_timer.status.working'),
          accent: (reached ? 'green' : 'onSurfaceVariant') as ColorChoice,
          segments: [
            {
              flex: 1,
              progress: targetMs > 0 ? Math.min(1, elapsedMs / targetMs) : 1,
              color: (reached ? 'green' : 'onSurfaceVariant') as ColorChoice,
            },
          ] satisfies TimerSegment[],
        };
      },
      distance: (target) => {
        // Nothing knows when a distance target will be met, so there is nothing to count down to: the
        // clock runs up, and the track follows the distance the user enters.
        const targetMetres = toMetres(target.value);
        const doneMetres = set.distance ? toMetres(set.distance) : undefined;
        const reached = !!doneMetres && doneMetres.gte(targetMetres);
        const progress =
          doneMetres && targetMetres.gt(0) ? Math.min(1, doneMetres.dividedBy(targetMetres).toNumber()) : 0;
        const done = set.distance ? localeFormatBigNumber(set.distance.value) + getShortUnit(set.distance.unit) : '-';
        return {
          reached,
          time: formatTimeSpan(elapsedMs),
          status: `${done} / ${localeFormatBigNumber(target.value.value) + getShortUnit(target.value.unit)}`,
          accent: (reached ? 'green' : 'onSurfaceVariant') as ColorChoice,
          segments: [
            {
              flex: 1,
              progress,
              color: (reached ? 'green' : 'onSurfaceVariant') as ColorChoice,
            },
          ] satisfies TimerSegment[],
        };
      },
    });
  }, [set, t]);

  const [timerState, setTimerState] = useState(getTimerState);

  useEffect(() => {
    const timer = setInterval(() => setTimerState(getTimerState()), 200);
    return () => clearInterval(timer);
  }, [getTimerState]);

  useEffect(() => {
    if (timerState.reached && !hasReachedTarget) {
      setHasReachedTarget(true);
      impactAsync(ImpactFeedbackStyle.Heavy).catch(console.log);
      setJiggling(true);
      setTimeout(() => setJiggling(false), 10);
    }
  }, [timerState.reached, hasReachedTarget]);

  // Persisting re-renders the parent, which hands us a fresh `onPersist`. Holding it in a ref keeps
  // that from resetting the interval and pushing the next write further out each time.
  const persist = useRef(onPersist);
  persist.current = onPersist;
  useEffect(() => {
    const interval = setInterval(() => persist.current(), persistIntervalMs);
    return () => clearInterval(interval);
  }, []);

  return (
    <TimerPane
      testID="cardio-timer"
      time={timerState.time}
      status={timerState.status}
      accent={timerState.accent}
      segments={timerState.segments}
      jiggling={jiggling}
      style={style}
      controls={<CardioTimerControls onStop={onStop} />}
    />
  );
}
