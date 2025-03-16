import RestTimer from '@/components/presentation/rest-timer';
import WeightedExercise from '@/components/presentation/weighted-exercise';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScollListener';
import { Rest } from '@/models/blueprint-models';
import { RecordedExercise } from '@/models/session-models';
import { LocalTime } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { Tabs } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

const defaultRecordedExercise: RecordedExercise = {
  blueprint: {
    name: 'Bench Press',
    link: '',
    notes: 'Some blueprint notes',
    repsPerSet: 8,
    sets: 3,
    restBetweenSets: Rest.medium,
    supersetWithNext: false,
    weightIncreaseOnSuccess: BigNumber('2.5'),
  },
  notes: 'Some notes on exercise',
  perSetWeight: false,
  potentialSets: [
    {
      set: {
        completionTime: LocalTime.parse('12:00:00'),
        repsCompleted: 8,
      },
      weight: BigNumber('100'),
    },
    {
      set: undefined,
      weight: BigNumber('100'),
    },
    {
      set: undefined,
      weight: BigNumber('100'),
    },
  ],
};

export default function Index() {
  const [weight, setWeight] = useState(new BigNumber(100));
  const [showWeight, setShowWeight] = useState(true);
  const [startTime, setStartTime] = useState(new Date());
  const [exercise, setExercise] = useState(defaultRecordedExercise);
  const { colors } = useAppTheme();
  const { setScrolled } = useScroll();

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
        },
      ]}
    >
      <Tabs.Screen options={{ title: 'Workout' }} />
      <ScrollView
        onScroll={(e) => setScrolled(e.nativeEvent.contentOffset.y > 0)}
      >
        <WeightedExercise
          isReadonly={false}
          previousRecordedExercises={[]}
          recordedExercise={exercise}
          showPreviousButton={true}
          toStartNext={true}
          togglePerSepWeight={() =>
            setExercise({ ...exercise, perSetWeight: !exercise.perSetWeight })
          }
          cycleRepCountForSet={(setIndex) => {}}
          onEditExercise={() => {}}
          onOpenLink={() => {}}
          onRemoveExercise={() => {}}
          showAdditionalActionsForSet={(setIndex) => {}}
          updateNotesForExercise={(notes) =>
            setExercise({ ...exercise, notes: notes })
          }
          updateWeightForExercise={(weight) => setWeight(weight)}
          updateWeightForSet={(setIndex, weight) => {}}
        />
        <WeightedExercise
          isReadonly={false}
          previousRecordedExercises={[]}
          recordedExercise={exercise}
          showPreviousButton={true}
          toStartNext={true}
          togglePerSepWeight={() =>
            setExercise({ ...exercise, perSetWeight: !exercise.perSetWeight })
          }
          cycleRepCountForSet={(setIndex) => {}}
          onEditExercise={() => {}}
          onOpenLink={() => {}}
          onRemoveExercise={() => {}}
          showAdditionalActionsForSet={(setIndex) => {}}
          updateNotesForExercise={(notes) =>
            setExercise({ ...exercise, notes: notes })
          }
          updateWeightForExercise={(weight) => setWeight(weight)}
          updateWeightForSet={(setIndex, weight) => {}}
        />
        <WeightedExercise
          isReadonly={false}
          previousRecordedExercises={[]}
          recordedExercise={exercise}
          showPreviousButton={true}
          toStartNext={true}
          togglePerSepWeight={() =>
            setExercise({ ...exercise, perSetWeight: !exercise.perSetWeight })
          }
          cycleRepCountForSet={(setIndex) => {}}
          onEditExercise={() => {}}
          onOpenLink={() => {}}
          onRemoveExercise={() => {}}
          showAdditionalActionsForSet={(setIndex) => {}}
          updateNotesForExercise={(notes) =>
            setExercise({ ...exercise, notes: notes })
          }
          updateWeightForExercise={(weight) => setWeight(weight)}
          updateWeightForSet={(setIndex, weight) => {}}
        />
        <WeightedExercise
          isReadonly={false}
          previousRecordedExercises={[]}
          recordedExercise={exercise}
          showPreviousButton={true}
          toStartNext={true}
          togglePerSepWeight={() =>
            setExercise({ ...exercise, perSetWeight: !exercise.perSetWeight })
          }
          cycleRepCountForSet={(setIndex) => {}}
          onEditExercise={() => {}}
          onOpenLink={() => {}}
          onRemoveExercise={() => {}}
          showAdditionalActionsForSet={(setIndex) => {}}
          updateNotesForExercise={(notes) =>
            setExercise({ ...exercise, notes: notes })
          }
          updateWeightForExercise={(weight) => setWeight(weight)}
          updateWeightForSet={(setIndex, weight) => {}}
        />
        <WeightedExercise
          isReadonly={false}
          previousRecordedExercises={[]}
          recordedExercise={exercise}
          showPreviousButton={true}
          toStartNext={true}
          togglePerSepWeight={() =>
            setExercise({ ...exercise, perSetWeight: !exercise.perSetWeight })
          }
          cycleRepCountForSet={(setIndex) => {}}
          onEditExercise={() => {}}
          onOpenLink={() => {}}
          onRemoveExercise={() => {}}
          showAdditionalActionsForSet={(setIndex) => {}}
          updateNotesForExercise={(notes) =>
            setExercise({ ...exercise, notes: notes })
          }
          updateWeightForExercise={(weight) => setWeight(weight)}
          updateWeightForSet={(setIndex, weight) => {}}
        />
        <WeightedExercise
          isReadonly={false}
          previousRecordedExercises={[]}
          recordedExercise={exercise}
          showPreviousButton={true}
          toStartNext={true}
          togglePerSepWeight={() =>
            setExercise({ ...exercise, perSetWeight: !exercise.perSetWeight })
          }
          cycleRepCountForSet={(setIndex) => {}}
          onEditExercise={() => {}}
          onOpenLink={() => {}}
          onRemoveExercise={() => {}}
          showAdditionalActionsForSet={(setIndex) => {}}
          updateNotesForExercise={(notes) =>
            setExercise({ ...exercise, notes: notes })
          }
          updateWeightForExercise={(weight) => setWeight(weight)}
          updateWeightForSet={(setIndex, weight) => {}}
        />

        <RestTimer
          visible={true}
          failed={true}
          rest={Rest.short}
          startTime={startTime}
        />
      </ScrollView>
    </View>
  );
}
