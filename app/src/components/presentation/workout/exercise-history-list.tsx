import EmptyInfo from '@/components/presentation/foundation/empty-info';
import Icon from '@/components/presentation/foundation/icon';
import { SegmentedListItem } from '@/components/presentation/foundation/segmented-list';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import WeightFormat from '@/components/presentation/foundation/weight-format';
import { rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { formatRepsTarget, RepsTarget } from '@/models/blueprint-models';
import {
  PotentialSet,
  RecordedCardioExercise,
  RecordedCardioExerciseSet,
  RecordedExercise,
  RecordedWeightedExercise,
} from '@/models/session-models';
import { consecutiveRuns } from '@/utils/consecutive-runs';
import { formatDistance } from '@/utils/distance';
import { formatDuration } from '@/utils/format-duration';
import { localeDisplayFormatBigNumber } from '@/utils/locale-bignumber';
import { LocalDate } from '@js-joda/core';
import { T, useTranslate } from '@tolgee/react';
import { LegendList } from '@legendapp/list';
import { useState } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { match, P } from 'ts-pattern';

type HistoryItem = { kind: 'month'; month: LocalDate } | { kind: 'exercise'; exercise: RecordedExercise };

type HistorySet = { set: PotentialSet; target: RepsTarget };

function withMonthHeaders(exercises: RecordedExercise[]): HistoryItem[] {
  const items: HistoryItem[] = [];
  let month: LocalDate | undefined;
  for (const exercise of exercises) {
    const exerciseMonth = exercise.latestTime?.toLocalDate().withDayOfMonth(1);
    if (exerciseMonth && !exerciseMonth.equals(month)) {
      items.push({ kind: 'month', month: exerciseMonth });
      month = exerciseMonth;
    }
    items.push({ kind: 'exercise', exercise });
  }
  return items;
}

export function ExerciseHistoryList(props: {
  exercises: RecordedExercise[];
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  const items = withMonthHeaders(props.exercises);

  return (
    <LegendList
      testID="exercise-history-list"
      data={items}
      nestedScrollEnabled
      getItemType={(item) => item.kind}
      keyExtractor={(item, index) =>
        item.kind === 'month' ? `month-${item.month.toString()}` : `${item.exercise.latestTime?.toString()}-${index}`
      }
      contentContainerStyle={props.contentContainerStyle}
      renderItem={({ item, index }) =>
        item.kind === 'month' ? (
          <MonthHeader month={item.month} />
        ) : (
          <ExerciseHistoryRow
            exercise={item.exercise}
            isFirst={items[index - 1]?.kind !== 'exercise'}
            isLast={items[index + 1]?.kind !== 'exercise'}
          />
        )
      }
      ListEmptyComponent={
        <View style={{ height: 100 }}>
          <EmptyInfo>
            <T keyName="exercise.never_done_before.message" />
          </EmptyInfo>
        </View>
      }
    />
  );
}

function MonthHeader(props: { month: LocalDate }) {
  const { colors } = useAppTheme();
  const formatDate = useFormatDate();
  return (
    <SurfaceText
      font="text-sm"
      weight="500"
      color="onSurfaceVariant"
      style={{ backgroundColor: colors.surface, paddingTop: spacing[3], paddingBottom: spacing[1] }}
    >
      {formatDate(props.month, { month: 'long', year: 'numeric' })}
    </SurfaceText>
  );
}

function ExerciseHistoryRow(props: { exercise: RecordedExercise; isFirst: boolean; isLast: boolean }) {
  const { exercise } = props;
  const date = exercise.latestTime?.toLocalDate();

  return (
    <View style={{ paddingTop: props.isFirst ? 0 : spacing[0.5] }}>
      <SegmentedListItem isFirst={props.isFirst} isLast={props.isLast}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing[3],
            paddingVertical: spacing[2],
            paddingHorizontal: spacing[3],
          }}
        >
          <HistoryDate date={date} />
          <View style={{ flex: 1, gap: spacing[1], paddingTop: spacing[1] }}>
            {match(exercise)
              .with(P.instanceOf(RecordedWeightedExercise), (exercise) => <WeightedRuns exercise={exercise} />)
              .with(P.instanceOf(RecordedCardioExercise), (exercise) => <CardioSets exercise={exercise} />)
              .exhaustive()}
            {exercise.notes ? <HistoryNotes notes={exercise.notes} /> : undefined}
          </View>
        </View>
      </SegmentedListItem>
    </View>
  );
}

function HistoryDate(props: { date: LocalDate | undefined }) {
  const formatDate = useFormatDate();
  return (
    <View style={{ width: spacing[10] }}>
      {props.date && (
        <>
          <SurfaceText font="text-base" weight="bold" style={{ fontVariant: ['tabular-nums'] }}>
            {formatDate(props.date, { day: 'numeric' })}
          </SurfaceText>
          <SurfaceText font="text-xs" color="onSurfaceVariant">
            {formatDate(props.date, { weekday: 'short' })}
          </SurfaceText>
        </>
      )}
    </View>
  );
}

function WeightedRuns(props: { exercise: RecordedWeightedExercise }) {
  const { exercise } = props;
  const showsWeight = exercise.blueprint.resistance !== 'none';
  const sets: HistorySet[] = exercise.potentialSets.map((set, index) => ({
    set,
    target: exercise.repsTargetForSet(index),
  }));
  const runs = consecutiveRuns(sets, (previous, next) => !showsWeight || previous.set.weight.equals(next.set.weight));

  return (
    <View style={{ gap: spacing[2] }}>
      {runs.map((run, index) => (
        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
          {showsWeight && (
            <View style={{ width: spacing[20], alignItems: 'flex-end' }}>
              <WeightFormat
                weight={run[0]!.set.weight}
                usesBodyweight={exercise.blueprint.resistance === 'bodyweight'}
                fontSize="text-base"
                fontWeight="bold"
              />
            </View>
          )}
          <View style={{ flexShrink: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing[0.5] }}>
            {run.map(({ set }, setIndex) => (
              <RepsSegment
                key={setIndex}
                reps={set.set?.repsCompleted}
                isFirst={setIndex === 0}
                isLast={setIndex === run.length - 1}
              />
            ))}
          </View>
          <SurfaceText font="text-xs" color="onSurfaceVariant" style={{ fontVariant: ['tabular-nums'] }}>
            {formatTargets(run.map((x) => x.target))}
          </SurfaceText>
        </View>
      ))}
    </View>
  );
}

function formatTargets(targets: RepsTarget[]): string {
  return consecutiveRuns(targets, (a, b) => a.min === b.min && a.max === b.max)
    .map((run) => `${run.length}×${formatRepsTarget(run[0]!)}`)
    .join(', ');
}

function RepsSegment(props: { reps: number | undefined; isFirst: boolean; isLast: boolean }) {
  const { colors } = useAppTheme();
  const isFilled = props.reps !== undefined;
  const startRadius = props.isFirst ? rounding.roundedRectangleRadius : rounding.segmentedBetweenRadius;
  const endRadius = props.isLast ? rounding.roundedRectangleRadius : rounding.segmentedBetweenRadius;
  return (
    <View
      style={{
        minWidth: spacing[8],
        height: spacing[8],
        paddingHorizontal: spacing[1],
        borderTopLeftRadius: startRadius,
        borderBottomLeftRadius: startRadius,
        borderTopRightRadius: endRadius,
        borderBottomRightRadius: endRadius,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isFilled ? colors.primary : colors.secondaryContainer,
      }}
    >
      <SurfaceText
        font="text-base"
        weight={isFilled ? 'bold' : undefined}
        style={{
          color: isFilled ? colors.onPrimary : colors.onSecondaryContainer + '99',
          fontVariant: ['tabular-nums'],
        }}
      >
        {props.reps ?? '-'}
      </SurfaceText>
    </View>
  );
}

function CardioSets(props: { exercise: RecordedCardioExercise }) {
  return (
    <View style={{ gap: spacing[1] }}>
      {props.exercise.sets.map((set, index) => (
        <CardioSetValues key={index} set={set} />
      ))}
    </View>
  );
}

/** Only the values this set's blueprint tracks -- an untracked field was never a number the user chose. */
function CardioSetValues(props: { set: RecordedCardioExerciseSet }) {
  const { set } = props;
  const { t } = useTranslate();
  const { blueprint } = set;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing[3], rowGap: spacing[1] }}>
      {set.tracksDuration && (
        <CardioValue value={set.duration && formatDuration(set.duration)} label={t('generic.time.label')} />
      )}
      {set.tracksDistance && (
        <CardioValue value={set.distance && formatDistance(set.distance)} label={t('exercise.distance.label')} />
      )}
      {blueprint.trackIncline && (
        <CardioValue
          value={set.incline && localeDisplayFormatBigNumber(set.incline)}
          label={t('exercise.incline.label')}
        />
      )}
      {blueprint.trackResistance && (
        <CardioValue
          value={set.resistance && localeDisplayFormatBigNumber(set.resistance)}
          label={t('exercise.resistance.label')}
        />
      )}
      {blueprint.trackWeight && (
        <CardioValue value={set.weight?.shortLocaleFormat()} label={t('weight.weight.label')} />
      )}
      {blueprint.trackSteps && <CardioValue value={set.steps?.toString()} label={t('exercise.steps.label')} />}
    </View>
  );
}

function CardioValue(props: { value: string | undefined; label: string }) {
  return (
    <SurfaceText font="text-sm" weight="bold" style={{ fontVariant: ['tabular-nums'] }}>
      {props.value ?? '-'}{' '}
      <SurfaceText font="text-xs" color="onSurfaceVariant">
        {props.label}
      </SurfaceText>
    </SurfaceText>
  );
}

function HistoryNotes(props: { notes: string }) {
  const { colors } = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      style={{ flexDirection: 'row', gap: spacing[2], alignItems: 'flex-start' }}
    >
      <Icon source="notes" size={14} color={colors.onSurfaceVariant} />
      <SurfaceText font="text-xs" color="onSurfaceVariant" numberOfLines={expanded ? undefined : 2} style={{ flex: 1 }}>
        {props.notes}
      </SurfaceText>
    </Pressable>
  );
}
