import { formatCardioTarget } from '@/components/presentation/exercise-blueprint-summary';
import { formatTimeSpan } from '@/components/presentation/rest-format';
import { SurfaceText } from '@/components/presentation/surface-text';
import WeightFormat from '@/components/presentation/weight-format';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Weight } from '@/models/weight';
import {
  RecordedExercise,
  RecordedWeightedExercise,
} from '@/models/session-models';
import { formatDistance } from '@/utils/distance';
import { localeFormatBigNumber } from '@/utils/locale-bignumber';
import { isNotNullOrUndefined } from '@/utils/null';
import { DateTimeFormatter } from '@js-joda/core';
import Enumerable from 'linq';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

interface ExerciseSummaryProps {
  exercise: RecordedExercise;
  showName: boolean;
  showDate: boolean;
  showWeight: boolean;
  isFilled: boolean;
}

function Chip(props: { children: ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[0.5],
        backgroundColor: colors.surfaceContainer,
        borderRadius: spacing[2],
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[2],
      }}
    >
      {props.children}
    </View>
  );
}

function ChipScroller(props: { children: ReactNode }) {
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          alignItems: 'flex-end',
          overflow: 'hidden',
        }}
      >
        <ScrollView
          horizontal
          contentContainerStyle={{
            gap: spacing[1],
          }}
        >
          {props.children}
        </ScrollView>
      </View>
    </View>
  );
}

function FilledChips(props: {
  exercise: RecordedExercise;
  showWeight: boolean;
}) {
  if (props.exercise instanceof RecordedWeightedExercise) {
    return getWeightAndRepsChips(props.exercise).map((chip, index) => (
      <Chip key={index}>
        <SurfaceText>{chip.repsCompleted?.toString() ?? '-'}</SurfaceText>
        {props.showWeight ? (
          <>
            <SurfaceText font="text-2xs" color="onSurface">
              @
            </SurfaceText>
            <WeightFormat color="onSurface" weight={chip.weight} />
          </>
        ) : undefined}
      </Chip>
    ));
  }
  return [
    props.exercise.duration && (
      <Chip key="duration">
        <SurfaceText>{formatTimeSpan(props.exercise.duration)}</SurfaceText>
      </Chip>
    ),

    props.exercise.distance && (
      <Chip key="distance">
        <SurfaceText>{formatDistance(props.exercise.distance)}</SurfaceText>
      </Chip>
    ),

    props.exercise.incline && (
      <Chip key="incline">
        <SurfaceText>
          {localeFormatBigNumber(props.exercise.incline)} incl
        </SurfaceText>
      </Chip>
    ),

    props.exercise.resistance && (
      <Chip key="resistance">
        <SurfaceText>
          {localeFormatBigNumber(props.exercise.resistance)} res
        </SurfaceText>
      </Chip>
    ),
  ].filter(isNotNullOrUndefined);
}

function PlannedChips(props: {
  exercise: RecordedExercise;
  showWeight: boolean;
}) {
  if (props.exercise instanceof RecordedWeightedExercise) {
    return getPlannedChipData(props.exercise).map((chip, index) => (
      <Chip key={index}>
        <SurfaceText color="onSurface">
          {chip.numSets}x{chip.repTarget}
        </SurfaceText>
        {props.showWeight ? (
          <>
            <SurfaceText color="onSurface" font="text-2xs">
              @
            </SurfaceText>
            <WeightFormat color="onSurface" weight={chip.weight} />
          </>
        ) : undefined}
      </Chip>
    ));
  }
  return (
    <Chip>
      <SurfaceText>
        {formatCardioTarget(props.exercise.blueprint.target)}
      </SurfaceText>
    </Chip>
  );
}

export default function ExerciseSummary({
  exercise,
  showName,
  showDate,
  showWeight,
  isFilled,
}: ExerciseSummaryProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing[2],
        overflow: 'hidden',
      }}
    >
      {showName ? (
        <SurfaceText style={{ maxWidth: '50%' }}>
          {exercise.blueprint.name}
        </SurfaceText>
      ) : undefined}
      {showDate ? (
        <SurfaceText>
          {exercise.latestTime?.format(DateTimeFormatter.ISO_DATE)}
        </SurfaceText>
      ) : undefined}
      <ChipScroller>
        {isFilled ? (
          <FilledChips exercise={exercise} showWeight={showWeight} />
        ) : (
          <PlannedChips exercise={exercise} showWeight={showWeight} />
        )}
      </ChipScroller>
    </View>
  );
}

interface WeightAndRepsChipData {
  repsCompleted: number | undefined;
  repTarget: number;
  weight: Weight;
}

interface PotentialSetChipData {
  repTarget: number;
  numSets: number;
  weight: Weight;
}

function getWeightAndRepsChips(
  exercise: RecordedWeightedExercise,
): WeightAndRepsChipData[] {
  return exercise.potentialSets.map((set) => ({
    repsCompleted: set.set?.repsCompleted,
    repTarget: exercise.blueprint.repsPerSet,
    weight: set.weight,
  }));
}

function getPlannedChipData(
  exercise: RecordedWeightedExercise,
): PotentialSetChipData[] {
  return Enumerable.from(exercise.potentialSets)
    .groupBy((x) => x.weight.shortLocaleFormat())
    .select((x) => ({
      repTarget: exercise.blueprint.repsPerSet,
      numSets: x.count(),
      weight: x.first().weight,
    }))
    .toArray();
}
