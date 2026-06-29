import SelectButton, { SelectButtonOption } from '@/components/presentation/foundation/select-button';
import {
  IncreaseAllEvenlyProgressiveOverload,
  IncreaseLowestSetProgressiveOverload,
  IncreaseStrategy,
  ProgressiveOverload,
  WeightedExerciseBlueprint,
} from '@/models/blueprint-models';
import { useTranslate } from '@tolgee/react';
import { ScrollView, View } from 'react-native';
import { match } from 'ts-pattern';
import { DecimalEditor } from '@/components/presentation/foundation/editors/decimal-editor';
import { Dialog, Divider, Text } from 'react-native-paper';
import { spacing } from '@/hooks/useAppTheme';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import { useState } from 'react';
import { PotentialSet, RecordedSet, RecordedWeightedExercise } from '@/models/session-models';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
import PotentialSetCounter from '@/components/presentation/workout/weighted/potential-set-counter';
import BigNumber from 'bignumber.js';
import { Portal } from 'react-native-paper';
import { OffsetDateTime } from '@js-joda/core';
import { Weight } from '@/models/weight';
import Icon from '@/components/presentation/foundation/gesture-wrappers/icon';

interface Props {
  value: ProgressiveOverload;
  onChange: (v: ProgressiveOverload) => void;
}

export function ProgressiveOverloadSelect(props: Props) {
  const { t } = useTranslate();
  const values: SelectButtonOption<ProgressiveOverload['type']>[] = [
    {
      value: 'NoProgressiveOverload',
      label: t('exercise.progressive_overload.no.label'),
    },
    {
      value: 'IncreaseAllEvenlyProgressiveOverload',
      label: t('exercise.progressive_overload.increase_all_evenly.label'),
    },
    {
      value: 'IncreaseLowestSetProgressiveOverload',
      label: t('exercise.progressive_overload.increase_lowest_set.label'),
    },
  ];
  return (
    <SelectButton
      value={props.value.type}
      onChange={(value) => {
        props.onChange(props.value.toType(value));
      }}
      options={values}
    />
  );
}

export function ProgressiveOverloadValuesEditor(props: Props) {
  return (
    <View style={{ gap: spacing[2] }}>
      {match(props.value)
        .with({ type: 'NoProgressiveOverload' }, () => undefined)
        .with({ type: 'IncreaseAllEvenlyProgressiveOverload' }, (x) => (
          <IncreaseAllEvenlyValues value={x} onChange={props.onChange} />
        ))
        .with({ type: 'IncreaseLowestSetProgressiveOverload' }, (x) => (
          <IncreaseLowestSetValues value={x} onChange={props.onChange} />
        ))
        .exhaustive()}
      {props.value.type !== 'NoProgressiveOverload' && (
        <>
          <Divider />
          <ProgressiveOverloadExample value={props.value} />
        </>
      )}
    </View>
  );
}

function IncreaseAllEvenlyValues(props: Props & { value: IncreaseAllEvenlyProgressiveOverload }) {
  const { t } = useTranslate();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text>{t('exercise.progressive_overload.increase_all_evenly.amount.label')}</Text>
      <DecimalEditor
        underlineColor="transparent"
        style={{ flex: 1, textAlign: 'right' }}
        value={props.value.amount}
        onChange={(amount) => props.onChange(props.value.with({ amount }))}
      />
    </View>
  );
}

function IncreaseLowestSetValues(props: Props & { value: IncreaseLowestSetProgressiveOverload }) {
  const { t } = useTranslate();
  const increaseStrategyOptions: SelectButtonOption<IncreaseStrategy>[] = [
    {
      label: t('exercise.progressive_overload.increase_lowest_set.increase_strategy.all.label'),
      value: 'all',
    },
    {
      label: t('exercise.progressive_overload.increase_lowest_set.increase_strategy.first.label'),
      value: 'first',
    },
    {
      label: t('exercise.progressive_overload.increase_lowest_set.increase_strategy.middle.label'),
      value: 'middle',
    },
    {
      label: t('exercise.progressive_overload.increase_lowest_set.increase_strategy.last.label'),
      value: 'last',
    },
  ];
  return (
    <View style={{ gap: spacing[1] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>{t('exercise.progressive_overload.increase_lowest_set.amount.label')}</Text>
        <DecimalEditor
          underlineColor="transparent"
          style={{ flex: 1, textAlign: 'right' }}
          value={props.value.amount}
          onChange={(amount) => props.onChange(props.value.with({ amount }))}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text>{t('exercise.progressive_overload.increase_lowest_set.increase_strategy.label')}</Text>
        <SelectButton
          value={props.value.increaseStrategy}
          onChange={(increaseStrategy) => props.onChange(props.value.with({ increaseStrategy }))}
          options={increaseStrategyOptions}
        />
      </View>
    </View>
  );
}

function ProgressiveOverloadExample(props: { value: ProgressiveOverload }) {
  const { t } = useTranslate();
  const [exampleOpen, setExampleOpen] = useState(false);
  const unit = usePreferredWeightUnit();
  const exampleExercise = RecordedWeightedExercise.empty(
    WeightedExerciseBlueprint.empty().with({ repsPerSet: 8 }),
    unit,
  )
    .withAllSets((s) =>
      s.with({
        set: new RecordedSet(8, OffsetDateTime.MIN),
        weight: new Weight(BigNumber(10).plus(props.value.weightIncrement), unit),
      }),
    )
    .withSet(0, (s) => s.with({ weight: new Weight(10, unit) }))
    .withSet(1, (s) => s.with({ weight: new Weight(10, unit) }));
  const appliedProgressiveOverload1 = props.value.applyProgressiveOverload(exampleExercise);
  const appliedProgressiveOverload2 = props.value.applyProgressiveOverload(appliedProgressiveOverload1);
  const appliedProgressiveOverload3 = props.value.applyProgressiveOverload(appliedProgressiveOverload2);
  if (props.value.type === 'NoProgressiveOverload') {
    return undefined;
  }
  return (
    <>
      <Button onPress={() => setExampleOpen(true)}>{t('exercise.progressive_overload.example.label')}</Button>
      <Portal>
        <Dialog visible={exampleOpen} onDismiss={() => setExampleOpen(false)}>
          <Dialog.Title>{t('exercise.progressive_overload.example.label')}</Dialog.Title>
          <Dialog.Content style={{ height: 400 }}>
            <ScrollView contentContainerStyle={{ gap: spacing[4], alignItems: 'center' }} style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', gap: spacing[2] }}>
                {exampleExercise.potentialSets.map((x, i) => (
                  <DummySet key={i} set={x} maxReps={8} />
                ))}
              </View>
              <Icon source={'arrowDownward'} size={24} />
              <View style={{ flexDirection: 'row', gap: spacing[2] }}>
                {appliedProgressiveOverload1.potentialSets.map((x, i) => (
                  <DummySet key={i} set={x} maxReps={8} />
                ))}
              </View>
              <Icon source={'arrowDownward'} size={24} />
              <View style={{ flexDirection: 'row', gap: spacing[2] }}>
                {appliedProgressiveOverload2.potentialSets.map((x, i) => (
                  <DummySet key={i} set={x} maxReps={8} />
                ))}
              </View>
              <Icon source={'arrowDownward'} size={24} />
              <View style={{ flexDirection: 'row', gap: spacing[2] }}>
                {appliedProgressiveOverload3.potentialSets.map((x, i) => (
                  <DummySet key={i} set={x} maxReps={8} />
                ))}
              </View>
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setExampleOpen(false)}>{t('generic.ok.button')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

function DummySet(props: { maxReps: number; set: PotentialSet }) {
  return (
    <PotentialSetCounter
      isReadonly
      maxReps={props.maxReps}
      onTap={() => {}}
      onUpdateReps={() => {}}
      onUpdateWeight={() => {}}
      previousRepCount={undefined}
      set={props.set}
      toStartNext={false}
      weightIncrement={BigNumber(0)}
    />
  );
}
