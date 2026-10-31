import { SegmentedList } from '@/components/presentation/foundation/segmented-list';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import WeightFormat from '@/components/presentation/foundation/weight-format';
import { formatExerciseSummary } from '@/components/presentation/summary/format-exercise-summary';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { shortFormatWeightUnit } from '@/models/weight';
import { localeDisplayFormatBigNumber } from '@/utils/locale-bignumber';
import { ExerciseChange, ExerciseComparison, ExerciseMeasure } from '@/utils/session-comparison';
import { useTranslate } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import { View } from 'react-native';
import { match } from 'ts-pattern';

export function ExerciseComparisonList({ comparisons }: { comparisons: ExerciseComparison[] }) {
  return (
    <SegmentedList
      items={comparisons}
      itemKey={(comparison) => comparison.key}
      renderItem={(comparison) => <ExerciseComparisonRow comparison={comparison} />}
    />
  );
}

function useFormatReps() {
  const { t } = useTranslate();
  return (count: number) =>
    count === 1 ? t('workout.post_workout.rep.label', { count }) : t('workout.post_workout.reps.label', { count });
}

function ExerciseComparisonRow({ comparison }: { comparison: ExerciseComparison }) {
  const { t } = useTranslate();
  const formatReps = useFormatReps();
  const { measure, change } = comparison;
  const wasDone = change.kind !== 'skipped' && change.kind !== 'pending';
  const sets = wasDone
    ? comparison.exercises
        .map((exercise) =>
          formatExerciseSummary(exercise, {
            isFilled: true,
            showWeight: true,
            bodyweightLabel: t('exercise.short_bodyweight.label'),
          }),
        )
        .filter((summary) => !!summary)
        .join(' · ')
    : undefined;
  const previous = formatPrevious(measure, formatReps);
  const detail = [sets, previous && t('workout.post_workout.was.label', { value: previous })]
    .filter((part) => !!part)
    .join(' · ');

  return (
    <View style={{ padding: spacing[4], flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
      <View style={{ flex: 1, gap: spacing[0.5] }}>
        <SurfaceText color={wasDone ? 'onSurface' : 'onSurfaceVariant'}>{comparison.name}</SurfaceText>
        {detail ? (
          <SurfaceText font="text-sm" color="onSurfaceVariant">
            {detail}
          </SurfaceText>
        ) : null}
      </View>
      <View style={{ alignItems: 'flex-end', gap: spacing[1] }}>
        {wasDone &&
          (measure.kind === 'volume' ? (
            <WeightFormat weight={measure.current} decimalPlaces={0} fontWeight="bold" />
          ) : (
            <SurfaceText weight="bold" style={{ fontVariant: ['tabular-nums'] }}>
              {formatReps(measure.current)}
            </SurfaceText>
          ))}
        <ChangeChip change={change} measure={measure} />
      </View>
    </View>
  );
}

function formatPrevious(measure: ExerciseMeasure, formatReps: (count: number) => string) {
  if (measure.previous === undefined) {
    return undefined;
  }
  if (measure.kind === 'reps') {
    return formatReps(measure.previous);
  }
  return `${localeDisplayFormatBigNumber(measure.previous.value, 0)} ${shortFormatWeightUnit(measure.previous.unit)}`;
}

function ChangeChip({ change, measure }: { change: ExerciseChange; measure: ExerciseMeasure }) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();

  const formatAmount = (amount: BigNumber) =>
    `${localeDisplayFormatBigNumber(amount, 0)}${measure.kind === 'volume' ? '%' : ''}`;
  const chip = match(change)
    .with({ kind: 'better' }, ({ amount }) => ({
      text: `+${formatAmount(amount)}`,
      ink: colors.green,
      background: colors.surface,
    }))
    .with({ kind: 'worse' }, ({ amount }) => ({
      text: `−${formatAmount(amount)}`,
      ink: colors.onSurfaceVariant,
      background: colors.surface,
    }))
    .with({ kind: 'new' }, () => ({
      text: t('workout.post_workout.new.label'),
      ink: colors.onSecondaryContainer,
      background: colors.secondaryContainer,
    }))
    .with({ kind: 'skipped' }, () => ({
      text: t('workout.post_workout.skipped.label'),
      ink: colors.onSurfaceVariant,
      background: undefined,
    }))
    .with({ kind: 'same' }, () => ({
      text: t('workout.post_workout.same.label'),
      ink: colors.onSurfaceVariant,
      background: undefined,
    }))
    .with({ kind: 'pending' }, () => undefined)
    .exhaustive();

  if (!chip) {
    return null;
  }

  return (
    <View
      style={{
        borderRadius: spacing[2],
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[0.5],
        backgroundColor: chip.background,
        borderWidth: change.kind === 'skipped' ? 1 : 0,
        borderColor: colors.outline,
      }}
    >
      <SurfaceText font="text-xs" weight="600" style={{ color: chip.ink, fontVariant: ['tabular-nums'] }}>
        {chip.text}
      </SurfaceText>
    </View>
  );
}
