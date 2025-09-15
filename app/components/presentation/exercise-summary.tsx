import { SurfaceText } from '@/components/presentation/surface-text';
import WeightFormat from '@/components/presentation/weight-format';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import {
  RecordedExercise,
  RecordedWeightedExercise,
} from '@/models/session-models';
import { assertWeightedExercise } from '@/models/temp';
import { localeFormatBigNumber } from '@/utils/locale-bignumber';
import { DateTimeFormatter } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import Enumerable from 'linq';
import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

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
  exercise: RecordedWeightedExercise;
  showWeight: boolean;
}) {
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

function PlannedChips(props: {
  exercise: RecordedWeightedExercise;
  showWeight: boolean;
}) {
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

export default function ExerciseSummary({
  exercise,
  showName,
  showDate,
  showWeight,
  isFilled,
}: ExerciseSummaryProps) {
  assertWeightedExercise(exercise);
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
          {exercise.lastRecordedSet?.set?.completionDateTime.format(
            DateTimeFormatter.ISO_DATE,
          )}
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
  weight: BigNumber;
}

interface PotentialSetChipData {
  repTarget: number;
  numSets: number;
  weight: BigNumber;
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
    .groupBy((x) => localeFormatBigNumber(x.weight))
    .select((x) => ({
      repTarget: exercise.blueprint.repsPerSet,
      numSets: x.count(),
      weight: x.first().weight,
    }))
    .toArray();
}
