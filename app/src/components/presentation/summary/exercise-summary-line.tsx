import { formatExerciseSummary } from '@/components/presentation/summary/format-exercise-summary';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { ColorChoice, spacing } from '@/hooks/useAppTheme';
import { RecordedExercise } from '@/models/session-models';
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';

interface ExerciseSummaryLineProps {
  exercise: RecordedExercise;
  isFilled: boolean;
  showWeight: boolean;
  color?: ColorChoice;
}

/** Half the row, so the two columns stay a grid: nothing here is ever wide enough to be worth breaking it for. */
const SETS_MAX_WIDTH = '50%';

/**
 * The chip-free counterpart to `ExerciseSummary`. Both columns hold their side of the row -- a long name wraps
 * within its own column rather than pushing the sets onto a line of their own, which reads as a broken row
 * rather than a deliberate one.
 */
export function ExerciseSummaryLine({ exercise, isFilled, showWeight, color = 'onSurface' }: ExerciseSummaryLineProps) {
  const { t } = useTranslate();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', columnGap: spacing[3] }}>
      <SurfaceText color={color} style={{ flexShrink: 1 }}>
        {exercise.blueprint.name}
      </SurfaceText>
      <SurfaceText color="onSurfaceVariant" style={{ maxWidth: SETS_MAX_WIDTH, textAlign: 'right' }}>
        {formatExerciseSummary(exercise, { isFilled, showWeight, bodyweightLabel: t('exercise.short_bodyweight.label') })}
      </SurfaceText>
    </View>
  );
}
