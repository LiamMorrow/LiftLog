import SelectPicker, { SelectPickerOption } from '@/components/presentation/foundation/select-picker';
import {
  applyProgression,
  IncreaseStrategy,
  ProgressionRule,
  WeightedExerciseBlueprint,
  weightIncrementFor,
} from '@/models/blueprint-models';
import { useTranslate } from '@tolgee/react';
import { ScrollView, View } from 'react-native';
import { match } from 'ts-pattern';
import { DecimalEditor } from '@/components/presentation/foundation/editors/decimal-editor';
import { Dialog, Divider, Text } from 'react-native-paper';
import { spacing } from '@/hooks/useAppTheme';
import Button from '@/components/presentation/foundation/button';
import { useState } from 'react';
import { PotentialSet, RecordedSet, RecordedWeightedExercise } from '@/models/session-models';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
import PotentialSetCounter from '@/components/presentation/workout/weighted/potential-set-counter';
import BigNumber from 'bignumber.js';
import { Portal } from 'react-native-paper';
import { OffsetDateTime } from '@js-joda/core';
import { Weight } from '@/models/weight';
import Icon from '@/components/presentation/foundation/icon';

interface Props {
  value: ProgressionRule[];
  onChange: (v: ProgressionRule[]) => void;
}

/**
 * The three arrangements the editor offers today, projected on and off the rule list. The list can
 * hold more than this shape can name, so the picker reads what it can and leaves the rest alone.
 */
type OverloadShape = 'none' | 'allEvenly' | 'lowestSet';

function shapeOf(progression: ProgressionRule[]): OverloadShape {
  const rule = progression.find((r) => r.axis === 'load');
  if (!rule) {
    return 'none';
  }
  return rule.scope.type === 'lowestSets' ? 'lowestSet' : 'allEvenly';
}

function loadRule(progression: ProgressionRule[]): ProgressionRule | undefined {
  return progression.find((r) => r.axis === 'load');
}

function withShape(progression: ProgressionRule[], shape: OverloadShape): ProgressionRule[] {
  const step = loadRule(progression)?.step ?? weightIncrementFor(progression);
  return match(shape)
    .returnType<ProgressionRule[]>()
    .with('none', () => [])
    .with('allEvenly', () => [ProgressionRule.load(step)])
    .with('lowestSet', () => [ProgressionRule.load(step, { type: 'lowestSets', pick: 'all' })])
    .exhaustive();
}

function withLoadRule(progression: ProgressionRule[], update: (rule: ProgressionRule) => ProgressionRule) {
  return progression.map((rule) => (rule.axis === 'load' ? update(rule) : rule));
}

export function ProgressiveOverloadSelect(props: Props) {
  const { t } = useTranslate();
  const values: SelectPickerOption<OverloadShape>[] = [
    {
      value: 'none',
      label: t('exercise.progressive_overload.no.label'),
    },
    {
      value: 'allEvenly',
      label: t('exercise.progressive_overload.increase_all_evenly.label'),
    },
    {
      value: 'lowestSet',
      label: t('exercise.progressive_overload.increase_lowest_set.label'),
    },
  ];
  return (
    <SelectPicker
      value={shapeOf(props.value)}
      onChange={(shape) => props.onChange(withShape(props.value, shape))}
      options={values}
    />
  );
}

export function ProgressiveOverloadValuesEditor(props: Props) {
  const shape = shapeOf(props.value);
  return (
    <View style={{ gap: spacing[2] }}>
      {match(shape)
        .with('none', () => undefined)
        .with('allEvenly', () => <IncreaseAllEvenlyValues {...props} />)
        .with('lowestSet', () => <IncreaseLowestSetValues {...props} />)
        .exhaustive()}
      {shape !== 'none' && (
        <>
          <Divider />
          <ProgressiveOverloadExample value={props.value} />
        </>
      )}
    </View>
  );
}

function StepEditor(props: Props & { label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text>{props.label}</Text>
      <DecimalEditor
        underlineColor="transparent"
        style={{ flex: 1, textAlign: 'right' }}
        value={loadRule(props.value)?.step ?? BigNumber(0)}
        onChange={(step) => props.onChange(withLoadRule(props.value, (rule) => rule.with({ step })))}
      />
    </View>
  );
}

function IncreaseAllEvenlyValues(props: Props) {
  const { t } = useTranslate();
  return <StepEditor {...props} label={t('exercise.progressive_overload.increase_all_evenly.amount.label')} />;
}

function IncreaseLowestSetValues(props: Props) {
  const { t } = useTranslate();
  const scope = loadRule(props.value)?.scope;
  const increaseStrategyOptions: SelectPickerOption<IncreaseStrategy>[] = [
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
      <StepEditor {...props} label={t('exercise.progressive_overload.increase_lowest_set.amount.label')} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text>{t('exercise.progressive_overload.increase_lowest_set.increase_strategy.label')}</Text>
        <SelectPicker
          value={scope?.type === 'lowestSets' ? scope.pick : 'all'}
          onChange={(pick) =>
            props.onChange(withLoadRule(props.value, (rule) => rule.with({ scope: { type: 'lowestSets', pick } })))
          }
          options={increaseStrategyOptions}
        />
      </View>
    </View>
  );
}

function ProgressiveOverloadExample(props: { value: ProgressionRule[] }) {
  const { t } = useTranslate();
  const [exampleOpen, setExampleOpen] = useState(false);
  const unit = usePreferredWeightUnit();
  const exampleExercise = RecordedWeightedExercise.empty(
    WeightedExerciseBlueprint.of({ plannedSets: Array.from({ length: 3 }, () => ({ reps: { min: 8, max: 8 } })) }),
    unit,
  )
    .withAllSets((s) =>
      s.with({
        set: RecordedSet.of({ repsCompleted: 8, completionDateTime: OffsetDateTime.MIN }),
        weight: new Weight(BigNumber(10).plus(weightIncrementFor(props.value)), unit),
      }),
    )
    .withSet(0, (s) => s.with({ weight: new Weight(10, unit) }))
    .withSet(1, (s) => s.with({ weight: new Weight(10, unit) }));
  const applied1 = applyProgression(props.value, exampleExercise);
  const applied2 = applyProgression(props.value, applied1);
  const applied3 = applyProgression(props.value, applied2);
  if (!props.value.length) {
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
              {[exampleExercise, applied1, applied2, applied3].map((step, stepIndex) => (
                <View key={stepIndex} style={{ gap: spacing[4], alignItems: 'center' }}>
                  {stepIndex > 0 && <Icon source={'arrowDownward'} size={24} />}
                  <View style={{ flexDirection: 'row', gap: spacing[2] }}>
                    {step.potentialSets.map((x, i) => (
                      <DummySet key={i} set={x} maxReps={8} />
                    ))}
                  </View>
                </View>
              ))}
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
      loadBasis="external"
      repsTarget={{ min: props.maxReps, max: props.maxReps }}
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
