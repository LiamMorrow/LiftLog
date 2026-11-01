import AddIcon from '@expo/material-symbols/add.xml';
import { SelectPickerOption } from '@/components/presentation/foundation/select-picker';
import { SegmentedListSelect } from '@/components/presentation/foundation/segmented-list-select';
import { SegmentedListSwitch } from '@/components/presentation/foundation/segmented-list-switch';
import {
  applyProgression,
  defaultCeilingFor,
  IncreaseStrategy,
  Resistance,
  ProgressionAxis,
  ProgressionRule,
  SetScope,
  unreachableFrom,
  WeightedExerciseBlueprint,
  withAddedRule,
} from '@/models/blueprint-models';
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';
import { DecimalInput, IntegerInput } from '@/components/presentation/foundation/editors/number-inputs';
import { AppText } from '@/components/presentation/foundation/app-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import ArrowUpwardIcon from '@expo/material-symbols/arrow_upward.xml';
import ArrowDownwardIcon from '@expo/material-symbols/arrow_downward.xml';
import DeleteIcon from '@expo/material-symbols/delete.xml';
import { useState } from 'react';
import { PotentialSet, RecordedSet, RecordedWeightedExercise } from '@/models/session-models';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
import PotentialSetCounter from '@/components/presentation/workout/weighted/potential-set-counter';
import BigNumber from 'bignumber.js';
import { OffsetDateTime } from '@js-joda/core';
import { Weight } from '@/models/weight';
import { NativeIcon } from '@/components/presentation/foundation/native-icon';
import ChevronRightIcon from '@expo/material-symbols/chevron_right.xml';
import { SegmentedGroup, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListLink } from '@/components/presentation/foundation/segmented-list-link';
import { localeDisplayFormatBigNumber } from '@/utils/locale-bignumber';
import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import Form from '@/components/presentation/foundation/form';
import { useRouteEditor } from '@/hooks/useRouteEditor';
import { Stack } from 'expo-router';

interface Props {
  /** The whole blueprint, so the worked example can run the rules against this exercise's own sets. */
  exercise: WeightedExerciseBlueprint;
  onChange: (v: ProgressionRule[]) => void;
}

/** The scope picker flattens the two shapes into one list, since only `lowestSets` carries a pick. */
type ScopeChoice = 'allSets' | IncreaseStrategy;

function scopeChoiceOf(scope: SetScope): ScopeChoice {
  return scope.type === 'allSets' ? 'allSets' : scope.pick;
}

function scopeOf(choice: ScopeChoice): SetScope {
  return choice === 'allSets' ? { type: 'allSets' } : { type: 'lowestSets', pick: choice };
}

function defaultRule(axis: ProgressionAxis): ProgressionRule {
  return axis === 'load'
    ? ProgressionRule.load(BigNumber(2.5))
    : ProgressionRule.of({ axis: 'reps', step: BigNumber(1) });
}

export interface ProgressionRuleEditorInput {
  exercise: WeightedExerciseBlueprint;
  index: number;
}

export function ProgressionRulesEditor(props: Props) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const rules = props.exercise.progression;
  const canMoveLoad = props.exercise.resistance !== 'none';
  const openRouteEditor = useRouteEditor(props.onChange);

  const openRule = (input: ProgressionRuleEditorInput) => openRouteEditor('/progression-rule', input);

  const addRule = () => {
    const next = withAddedRule(props.exercise);
    props.onChange(next);
    openRule({
      exercise: props.exercise.with({ progression: next }),
      index: next.findLastIndex((rule) => !rules.includes(rule)),
    });
  };

  const deadFrom = unreachableFrom(rules, canMoveLoad);
  const neverRuns = (index: number) => deadFrom !== undefined && index >= deadFrom;
  const ruleSummary = useRuleSummary();
  const ruleDetail = useRuleDetail();

  return (
    <View testID="progression-rules">
      <SegmentedGroup>
        {[
          ...rules.map((rule, index) => (
            <SegmentListFormElement
              key={`rule-${index}`}
              testID={`progression-rule-${index}`}
              label={ruleSummary(rule)}
              supportingText={ruleDetail(rule, neverRuns(index))}
              style={neverRuns(index) ? { opacity: 0.5 } : undefined}
              onPress={() => openRule({ exercise: props.exercise, index })}
              right={
                <NativeIcon
                  icon={ChevronRightIcon}
                  systemImage="chevron.right"
                  size={20}
                  color={colors.onSurfaceVariant}
                />
              }
            />
          )),
          <SegmentListFormElement
            key="add"
            testID="progression-add-rule"
            label={t('exercise.progression.add_rule.label')}
            icon={AddIcon}
            systemImage="plus"
            supportingText={rules.length ? undefined : t('exercise.progression.none.body')}
            onPress={addRule}
          />,
          ...(rules.length
            ? [
                <SegmentedListLink
                  key="example"
                  label={t('exercise.progressive_overload.example.label')}
                  onPress={() => openRouteEditor('/progression-example', props.exercise)}
                />,
              ]
            : []),
        ]}
      </SegmentedGroup>
    </View>
  );
}

function useRuleSummary() {
  const { t } = useTranslate();
  return (rule: ProgressionRule) =>
    t('exercise.progression.rule.summary.label', {
      axis:
        rule.axis === 'load' ? t('exercise.progression.axis.load.label') : t('exercise.progression.axis.reps.label'),
      step: localeDisplayFormatBigNumber(rule.step),
    });
}

function useRuleDetail() {
  const { t } = useTranslate();
  const scopeLabels: Record<ScopeChoice, string> = {
    allSets: t('exercise.progression.scope.all_sets.label'),
    all: t('exercise.progressive_overload.increase_lowest_set.increase_strategy.all.label'),
    first: t('exercise.progressive_overload.increase_lowest_set.increase_strategy.first.label'),
    middle: t('exercise.progressive_overload.increase_lowest_set.increase_strategy.middle.label'),
    last: t('exercise.progressive_overload.increase_lowest_set.increase_strategy.last.label'),
  };
  return (rule: ProgressionRule, neverRuns: boolean) =>
    [
      scopeLabels[scopeChoiceOf(rule.scope)],
      rule.ceiling !== undefined &&
        t('exercise.progression.rule.ceiling_summary.label', { ceiling: rule.ceiling.toString() }),
      rule.ceiling !== undefined && rule.onCeiling === 'reset' && t('exercise.progression.rule.reset_summary.label'),
      neverRuns && t('exercise.progression.rule.never_runs.label'),
    ]
      .filter(Boolean)
      .join(' · ');
}

export function ProgressionRuleEditor(props: {
  input: ProgressionRuleEditorInput;
  onChange: (rules: ProgressionRule[]) => void;
  onClose: () => void;
}) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const [exercise, setExercise] = useState(props.input.exercise);
  const [index, setIndex] = useState(props.input.index);
  const rules = exercise.progression;
  const rule = rules[index];
  const canMoveLoad = exercise.resistance !== 'none';
  const deadFrom = unreachableFrom(rules, canMoveLoad);

  if (!rule) {
    return null;
  }

  const update = (next: ProgressionRule[], nextIndex = index) => {
    setExercise(exercise.with({ progression: next }));
    setIndex(nextIndex);
    props.onChange(next);
  };

  const remove = () => {
    props.onChange(rules.filter((_, i) => i !== index));
    props.onClose();
  };

  const swapWith = (other: number) =>
    update(
      rules.map((existing, i) => (i === index ? rules[other]! : i === other ? rules[index]! : existing)),
      other,
    );

  const neverRuns = deadFrom !== undefined && index >= deadFrom;
  const canMoveUp = index > 0;
  const canMoveDown = index < rules.length - 1;

  return (
    <FullHeightScrollView modal avoidKeyboard>
      <Stack.Screen
        options={{
          title:
            t('exercise.progression.rule.title', { position: index + 1 }) +
            (neverRuns ? ` · ${t('exercise.progression.rule.never_runs.label')}` : ''),
        }}
      />
      <Form>
        <RuleEditor
          rule={rule}
          canMoveLoad={canMoveLoad}
          hasLaterRule={canMoveDown}
          defaultCeiling={defaultCeilingFor(exercise)}
          onChange={(next) => update(rules.map((existing, i) => (i === index ? next : existing)))}
        />
        {deadFrom === index + 1 && (
          <AppText variant="bodySmall" style={{ color: colors.error }}>
            {rule.axis === 'load'
              ? t('exercise.progression.blocks_later.load.body')
              : t('exercise.progression.blocks_later.reps.body')}
          </AppText>
        )}
        <SegmentedGroup>
          {[
            ...(rules.length > 1
              ? [
                  <SegmentListFormElement
                    key="up"
                    label={t('exercise.progression.rule.move_up.label')}
                    icon={ArrowUpwardIcon}
                    systemImage="arrow.up"
                    style={canMoveUp ? undefined : { opacity: 0.5 }}
                    onPress={canMoveUp ? () => swapWith(index - 1) : undefined}
                  />,
                  <SegmentListFormElement
                    key="down"
                    label={t('exercise.progression.rule.move_down.label')}
                    icon={ArrowDownwardIcon}
                    systemImage="arrow.down"
                    style={canMoveDown ? undefined : { opacity: 0.5 }}
                    onPress={canMoveDown ? () => swapWith(index + 1) : undefined}
                  />,
                ]
              : []),
            <SegmentListFormElement
              key="remove"
              testID={`progression-remove-${index}`}
              label={t('generic.remove.button')}
              icon={DeleteIcon}
              systemImage="trash"
              destructive
              onPress={remove}
            />,
          ]}
        </SegmentedGroup>
      </Form>
    </FullHeightScrollView>
  );
}

function RuleEditor(props: {
  rule: ProgressionRule;
  canMoveLoad: boolean;
  hasLaterRule: boolean;
  defaultCeiling: BigNumber;
  onChange: (rule: ProgressionRule) => void;
}) {
  const { t } = useTranslate();
  const { rule } = props;

  const axisOptions: SelectPickerOption<ProgressionAxis>[] = [
    { value: 'load', label: t('exercise.progression.axis.load.label') },
    { value: 'reps', label: t('exercise.progression.axis.reps.label') },
  ];

  const scopeOptions: SelectPickerOption<ScopeChoice>[] = [
    { value: 'allSets', label: t('exercise.progression.scope.all_sets.label') },
    { value: 'all', label: t('exercise.progressive_overload.increase_lowest_set.increase_strategy.all.label') },
    { value: 'first', label: t('exercise.progressive_overload.increase_lowest_set.increase_strategy.first.label') },
    { value: 'middle', label: t('exercise.progressive_overload.increase_lowest_set.increase_strategy.middle.label') },
    { value: 'last', label: t('exercise.progressive_overload.increase_lowest_set.increase_strategy.last.label') },
  ];

  const stepLabel =
    rule.axis === 'reps'
      ? t('exercise.progression.step.reps.label')
      : t('exercise.progressive_overload.increase_all_evenly.amount.label');

  return (
    <>
      <SegmentedGroup>
        {/*
         * Always offered, even where the exercise carries no load to move. Turning the load off leaves
         * any load rule behind it inert, and hiding the axis would leave a rule on screen doing nothing
         * with no way to say what it should do instead.
         */}
        <SegmentedListSelect
          label={t('exercise.progression.axis.label')}
          value={rule.axis}
          options={axisOptions}
          onChange={(axis) =>
            props.onChange(axisFor(rule, axis, props.hasLaterRule ? props.defaultCeiling : undefined))
          }
          supportingText={
            rule.axis === 'load' && !props.canMoveLoad ? (
              <AppText variant="bodySmall" color="error">
                {t('exercise.progression.axis.no_load.body')}
              </AppText>
            ) : undefined
          }
        />
        <SegmentListFormElement
          label={stepLabel}
          right={
            rule.axis === 'reps' ? (
              <IntegerInput
                minWidth={spacing[20]}
                value={rule.step.toNumber()}
                onChange={(step) => props.onChange(rule.with({ step: BigNumber(step) }))}
                accessibilityLabel={stepLabel}
              />
            ) : (
              <DecimalInput
                minWidth={spacing[20]}
                value={rule.step}
                onChange={(step) => props.onChange(rule.with({ step }))}
                accessibilityLabel={stepLabel}
              />
            )
          }
        />
        <SegmentedListSelect
          label={t('exercise.progression.scope.label')}
          value={scopeChoiceOf(rule.scope)}
          options={scopeOptions}
          onChange={(choice) => props.onChange(rule.with({ scope: scopeOf(choice) }))}
        />
      </SegmentedGroup>

      {rule.axis === 'reps' && (
        <SegmentedGroup>
          <SegmentedListSwitch
            value={rule.ceiling !== undefined}
            label={t('exercise.progression.ceiling.title')}
            supportingText={t('exercise.progression.ceiling.body')}
            onValueChange={(on) => props.onChange(rule.with({ ceiling: on ? props.defaultCeiling : undefined }))}
          />
          {rule.ceiling !== undefined && (
            <SegmentListFormElement
              label={t('exercise.progression.ceiling.label')}
              right={
                <IntegerInput
                  minWidth={spacing[20]}
                  value={rule.ceiling.toNumber()}
                  onChange={(ceiling) => props.onChange(rule.with({ ceiling: BigNumber(ceiling) }))}
                  accessibilityLabel={t('exercise.progression.ceiling.label')}
                />
              }
            />
          )}
          {/* Only means anything with somewhere to hand over to; on its own it would never fire. */}
          {rule.ceiling !== undefined && props.hasLaterRule && (
            <SegmentedListSwitch
              value={rule.onCeiling === 'reset'}
              label={t('exercise.progression.reset.title')}
              supportingText={t('exercise.progression.reset.body')}
              onValueChange={(on) => props.onChange(rule.with({ onCeiling: on ? 'reset' : undefined }))}
            />
          )}
        </SegmentedGroup>
      )}
    </>
  );
}

/**
 * Switching axis re-seeds the step, since a step is in its axis's own unit and 2.5 reps is not what
 * anyone meant by 2.5 kg. A ceiling is measured in reps, so it goes when the rule starts moving load,
 * and comes back when a rule with something behind it starts moving reps: unbounded there, it would
 * never hand over.
 */
function axisFor(rule: ProgressionRule, axis: ProgressionAxis, handOverAt: BigNumber | undefined): ProgressionRule {
  if (axis === rule.axis) {
    return rule;
  }
  const ceiling = axis === 'reps' ? handOverAt : undefined;
  return rule.with({
    axis,
    step: defaultRule(axis).step,
    ceiling,
    onCeiling: ceiling && 'reset',
  });
}

export function ProgressionExample(props: { exercise: WeightedExerciseBlueprint }) {
  const { t } = useTranslate();
  const unit = usePreferredWeightUnit();
  const resistance = props.exercise.resistance;
  const start = new Weight(resistance === 'none' ? 0 : 10, unit);
  const exampleExercise = hitTargets(
    RecordedWeightedExercise.empty(props.exercise, unit).withAllSets((s) => s.with({ weight: start })),
  );

  // Four rungs: where it starts, then what three more successful sessions do to it.
  const rungs = [1, 2, 3].reduce<RecordedWeightedExercise[]>(
    (all) => [...all, hitTargets(applyProgression(props.exercise.progression, all[all.length - 1]!))],
    [exampleExercise],
  );

  return (
    <FullHeightScrollView modal>
      <Stack.Screen options={{ title: t('exercise.progressive_overload.example.label') }} />
      <View style={{ gap: spacing[4], alignItems: 'center', paddingHorizontal: spacing.pageHorizontalMargin }}>
        {rungs.map((rung, index) => (
          <View key={index} style={{ gap: spacing[4], alignItems: 'center' }}>
            {index > 0 && <NativeIcon icon={ArrowDownwardIcon} systemImage="arrow.down" size={24} />}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing[2] }}>
              {rung.potentialSets.map((set, setIndex) => (
                <DummySet
                  key={setIndex}
                  set={set}
                  resistance={resistance}
                  repsTarget={rung.repsTargetForSet(setIndex)}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    </FullHeightScrollView>
  );
}

/**
 * Logs every set at its own target. The rules only advance a rung that was met, so a rung showing
 * anything else would be showing a session that earns nothing.
 */
function hitTargets(exercise: RecordedWeightedExercise): RecordedWeightedExercise {
  return exercise.potentialSets.reduce(
    (ex, _, index) =>
      ex.withSet(index, (s) =>
        s.with({
          set: RecordedSet.of({
            repsCompleted: ex.repsTargetForSet(index).max,
            completionDateTime: OffsetDateTime.MIN,
          }),
        }),
      ),
    exercise,
  );
}

function DummySet(props: { set: PotentialSet; resistance: Resistance; repsTarget: { min: number; max: number } }) {
  return (
    <PotentialSetCounter
      isReadonly
      resistance={props.resistance}
      repsTarget={props.repsTarget}
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
