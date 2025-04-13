import { SurfaceText } from '@/components/presentation/surface-text';
import WeightFormat from '@/components/presentation/weight-format';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { RecordedExercise } from '@/models/session-models';
import BigNumber from 'bignumber.js';
import Enumerable from 'linq';
import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

interface ExerciseSummaryProps {
  exercise: RecordedExercise;
  showName: boolean;
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

function FilledChips(props: { exercise: RecordedExercise }) {
  return (
    <ScrollView
      horizontal
      contentContainerStyle={{
        gap: spacing[1],
      }}
    >
      {getWeightAndRepsChips(props.exercise).map((chip, index) => (
        <Chip key={index}>
          <SurfaceText>{chip.repsCompleted?.toString() ?? '-'}</SurfaceText>
          <SurfaceText font="text-2xs">@</SurfaceText>
          <WeightFormat weight={chip.weight} />
        </Chip>
      ))}
    </ScrollView>
  );
}

function PlannedChips(props: { exercise: RecordedExercise }) {
  return (
    <ScrollView
      horizontal
      contentContainerStyle={{
        gap: spacing[1],
      }}
    >
      {getPlannedChipData(props.exercise).map((chip, index) => (
        <Chip key={index}>
          <SurfaceText>
            {chip.numSets}x{chip.repTarget}
          </SurfaceText>
          <SurfaceText font="text-2xs">@</SurfaceText>
          <WeightFormat weight={chip.weight} />
        </Chip>
      ))}
    </ScrollView>
  );
}

export default function ExerciseSummary({
  exercise,
  showName,
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
      <View
        style={{
          maxWidth: '80%',
        }}
      >
        {isFilled ? (
          <FilledChips exercise={exercise} />
        ) : (
          <PlannedChips exercise={exercise} />
        )}
      </View>
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
