import { SurfaceText } from '@/components/presentation/surface-text';
import WeightFormat from '@/components/presentation/weight-format';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { RecordedExercise } from '@/models/session-models';
import { DateTimeFormatter } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import Enumerable from 'linq';
import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

interface ExerciseSummaryProps {
  exercise: RecordedExercise;
  showName: boolean;
  showDate: boolean;
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
        backgroundColor: colors.surfaceContainerHighest,
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

function FilledChips(props: { exercise: RecordedExercise }) {
  return getWeightAndRepsChips(props.exercise).map((chip, index) => (
    <Chip key={index}>
      <SurfaceText>{chip.repsCompleted?.toString() ?? '-'}</SurfaceText>
      <SurfaceText font="text-2xs">@</SurfaceText>
      <WeightFormat weight={chip.weight} />
    </Chip>
  ));
}

function PlannedChips(props: { exercise: RecordedExercise }) {
  return getPlannedChipData(props.exercise).map((chip, index) => (
    <Chip key={index}>
      <SurfaceText>
        {chip.numSets}x{chip.repTarget}
      </SurfaceText>
      <SurfaceText font="text-2xs">@</SurfaceText>
      <WeightFormat weight={chip.weight} />
    </Chip>
  ));
}

export default function ExerciseSummary({
  exercise,
  showName,
  showDate,
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
        <SurfaceText>{exercise.blueprint.name}</SurfaceText>
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
          <FilledChips exercise={exercise} />
        ) : (
          <PlannedChips exercise={exercise} />
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
  exercise: RecordedExercise,
): WeightAndRepsChipData[] {
  return exercise.potentialSets.map((set) => ({
    repsCompleted: set.set?.repsCompleted,
    repTarget: exercise.blueprint.repsPerSet,
    weight: set.weight,
  }));
}

function getPlannedChipData(
  exercise: RecordedExercise,
): PotentialSetChipData[] {
  return Enumerable.from(exercise.potentialSets)
    .groupBy((x) => x.weight.toString())
    .select((x) => ({
      repTarget: exercise.blueprint.repsPerSet,
      numSets: x.count(),
      weight: x.first().weight,
    }))
    .toArray();
}
