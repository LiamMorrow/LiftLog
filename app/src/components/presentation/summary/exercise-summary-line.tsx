import { formatExerciseSummary } from '@/components/presentation/summary/format-exercise-summary';
import { summarySetRuns } from '@/components/presentation/summary/summary-set-runs';
import { AppText } from '@/components/presentation/foundation/app-text';
import WeightFormat from '@/components/presentation/foundation/weight-format';
import { RepsStrip } from '@/components/presentation/workout/reps-strip';
import { ColorChoice, spacing } from '@/hooks/useAppTheme';
import { RecordedExercise, RecordedWeightedExercise } from '@/models/session-models';
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';

interface ExerciseSummaryLineProps {
  exercise: RecordedExercise;
  isFilled: boolean;
  showWeight: boolean;
  showSets: boolean;
  color?: ColorChoice;
}

/** Half the row, so the two columns stay a grid: nothing here is ever wide enough to be worth breaking it for. */
const SETS_MAX_WIDTH = '50%';

const STRIP_MAX_WIDTH = '65%';

export function ExerciseSummaryLine({
  exercise,
  isFilled,
  showWeight,
  showSets,
  color = 'onSurface',
}: ExerciseSummaryLineProps) {
  const { t } = useTranslate();
  const showsStrip = showSets && exercise instanceof RecordedWeightedExercise;
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: showsStrip ? 'center' : undefined,
        columnGap: spacing[3],
      }}
    >
      <AppText variant="bodyLarge" color={color} style={{ flexShrink: 1 }}>
        {exercise.blueprint.name}
      </AppText>
      {showsStrip ? (
        <SetRuns exercise={exercise} isFilled={isFilled} showWeight={showWeight} />
      ) : (
        <AppText variant="bodyLarge" color="onSurfaceVariant" style={{ maxWidth: SETS_MAX_WIDTH, textAlign: 'right' }}>
          {formatExerciseSummary(exercise, {
            isFilled,
            showWeight,
            bodyweightLabel: t('exercise.short_bodyweight.label'),
          })}
        </AppText>
      )}
    </View>
  );
}

function SetRuns(props: { exercise: RecordedWeightedExercise; isFilled: boolean; showWeight: boolean }) {
  const { exercise } = props;
  const showsWeight = props.showWeight && exercise.tracksResistance;
  const usesBodyweight = exercise.blueprint.resistance === 'bodyweight';
  const runs = summarySetRuns(exercise, { isFilled: props.isFilled, groupByWeight: showsWeight });

  return (
    <View style={{ maxWidth: STRIP_MAX_WIDTH, alignItems: 'flex-end', gap: spacing[1] }}>
      {runs.map((run, index) => (
        <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2] }}>
          {showsWeight && (usesBodyweight || !run.weight.value.isZero()) && (
            <View style={{ height: spacing[6], justifyContent: 'center' }}>
              <WeightFormat
                weight={run.weight}
                usesBodyweight={usesBodyweight}
                variant="bodyMedium"
                color="onSurfaceVariant"
              />
            </View>
          )}
          <RepsStrip compact sets={run.sets} style={{ flexShrink: 1, justifyContent: 'flex-end' }} />
        </View>
      ))}
    </View>
  );
}
