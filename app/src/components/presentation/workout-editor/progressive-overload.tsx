import AddIcon from '@expo/material-symbols/add.xml';
import SelectPicker, { SelectPickerOption } from '@/components/presentation/foundation/select-picker';
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
import { ScrollView, View } from 'react-native';
import { DecimalInput, IntegerInput } from '@/components/presentation/foundation/editors/number-inputs';
import { AppText } from '@/components/presentation/foundation/app-text';
import { Dialog } from 'react-native-paper';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import Button from '@/components/presentation/foundation/button';
import { NativeIconButton } from '@/components/presentation/foundation/native-icon-button';
import ArrowUpwardIcon from '@expo/material-symbols/arrow_upward.xml';
import ArrowDownwardIcon from '@expo/material-symbols/arrow_downward.xml';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { Switch } from '@/components/presentation/foundation/switch';
import { useState } from 'react';
import { PotentialSet, RecordedSet, RecordedWeightedExercise } from '@/models/session-models';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
import PotentialSetCounter from '@/components/presentation/workout/weighted/potential-set-counter';
import BigNumber from 'bignumber.js';
import { Portal } from 'react-native-paper';
import { OffsetDateTime } from '@js-joda/core';
import { Weight } from '@/models/weight';
import { Icon } from '@/components/presentation/foundation/icon';
import { SegmentedGroup, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListLink } from '@/components/presentation/foundation/segmented-list-link';
import { localeDisplayFormatBigNumber } from '@/utils/locale-bignumber';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

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

export function ProgressionRulesEditor(props: Props) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const rules = props.exercise.progression;
  const canMoveLoad = props.exercise.resistance !== 'none';
  const [editingIndex, setEditingIndex] = useState<number | undefined>(undefined);
  const [exampleOpen, setExampleOpen] = useState(false);

  const replaceRule = (index: number, rule: ProgressionRule) =>
    props.onChange(rules.map((existing, i) => (i === index ? rule : existing)));

  const removeRule = (index: number) => {
    setEditingIndex(undefined);
    props.onChange(rules.filter((_, i) => i !== index));
  };

  const swapRules = (index: number, other: number) => {
    setEditingIndex(other);
    props.onChange(rules.map((rule, i) => (i === index ? rules[other]! : i === other ? rules[index]! : rule)));
  };

  const addRule = () => {
    const next = withAddedRule(props.exercise);
    props.onChange(next);
    setEditingIndex(next.findLastIndex((rule) => !rules.includes(rule)));
  };

  const deadFrom = unreachableFrom(rules, canMoveLoad);
  const defaultCeiling = defaultCeilingFor(props.exercise);
  const neverRuns = (index: number) => deadFrom !== undefined && index >= deadFrom;
  const editingRule = editingIndex === undefined ? undefined : rules[editingIndex];

  const scopeLabels: Record<ScopeChoice, string> = {
    allSets: t('exercise.progression.scope.all_sets.label'),
    all: t('exercise.progressive_overload.increase_lowest_set.increase_strategy.all.label'),
    first: t('exercise.progressive_overload.increase_lowest_set.increase_strategy.first.label'),
    middle: t('exercise.progressive_overload.increase_lowest_set.increase_strategy.middle.label'),
    last: t('exercise.progressive_overload.increase_lowest_set.increase_strategy.last.label'),
  };
  const ruleSummary = (rule: ProgressionRule) =>
    t('exercise.progression.rule.summary.label', {
      axis:
        rule.axis === 'load' ? t('exercise.progression.axis.load.label') : t('exercise.progression.axis.reps.label'),
      step: localeDisplayFormatBigNumber(rule.step),
    });
  const ruleDetail = (rule: ProgressionRule, index: number) =>
    [
      scopeLabels[scopeChoiceOf(rule.scope)],
      rule.ceiling !== undefined &&
        t('exercise.progression.rule.ceiling_summary.label', { ceiling: rule.ceiling.toString() }),
      rule.ceiling !== undefined && rule.onCeiling === 'reset' && t('exercise.progression.rule.reset_summary.label'),
      neverRuns(index) && t('exercise.progression.rule.never_runs.label'),
    ]
      .filter(Boolean)
      .join(' · ');

  return (
    <View testID="progression-rules">
      <SegmentedGroup>
        {[
          ...rules.map((rule, index) => (
            <SegmentListFormElement
              key={`rule-${index}`}
              testID={`progression-rule-${index}`}
              label={ruleSummary(rule)}
              supportingText={ruleDetail(rule, index)}
              style={neverRuns(index) ? { opacity: 0.5 } : undefined}
              onPress={() => setEditingIndex(index)}
              right={<Icon source="chevronRight" size={20} color={colors.onSurfaceVariant} />}
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
                  onPress={() => setExampleOpen(true)}
                />,
              ]
            : []),
        ]}
      </SegmentedGroup>
      {editingRule && editingIndex !== undefined ? (
        <Portal>
          <KeyboardAvoidingView behavior="height" style={{ flex: 1, pointerEvents: 'box-none' }}>
            <Dialog visible onDismiss={() => setEditingIndex(undefined)}>
              <Dialog.Title>
                {t('exercise.progression.rule.title', { position: editingIndex + 1 })}
                {neverRuns(editingIndex) && ` · ${t('exercise.progression.rule.never_runs.label')}`}
              </Dialog.Title>
              <Dialog.Content>
                <RuleEditor
                  rule={editingRule}
                  canMoveLoad={canMoveLoad}
                  hasLaterRule={editingIndex < rules.length - 1}
                  defaultCeiling={defaultCeiling}
                  onChange={(next) => replaceRule(editingIndex, next)}
                />
                {deadFrom === editingIndex + 1 && (
                  <AppText variant="bodySmall" style={{ color: colors.error, marginBlockStart: spacing[2] }}>
                    {editingRule.axis === 'load'
                      ? t('exercise.progression.blocks_later.load.body')
                      : t('exercise.progression.blocks_later.reps.body')}
                  </AppText>
                )}
              </Dialog.Content>
              <Dialog.Actions>
                {rules.length > 1 && (
                  <>
                    <NativeIconButton
                      icon={ArrowUpwardIcon}
                      systemImage="arrow.up"
                      iconSize={18}
                      disabled={editingIndex === 0}
                      label={t('exercise.progression.rule.move_up.label')}
                      onPress={() => swapRules(editingIndex, editingIndex - 1)}
                    />
                    <NativeIconButton
                      icon={ArrowDownwardIcon}
                      systemImage="arrow.down"
                      iconSize={18}
                      disabled={editingIndex === rules.length - 1}
                      label={t('exercise.progression.rule.move_down.label')}
                      onPress={() => swapRules(editingIndex, editingIndex + 1)}
                    />
                    <View style={{ flex: 1 }} />
                  </>
                )}
                <Button
                  textColor={colors.error}
                  testID={`progression-remove-${editingIndex}`}
                  onPress={() => removeRule(editingIndex)}
                >
                  {t('generic.remove.button')}
                </Button>
                <Button testID="progression-rule-done" onPress={() => setEditingIndex(undefined)}>
                  {t('generic.done.button')}
                </Button>
              </Dialog.Actions>
            </Dialog>
          </KeyboardAvoidingView>
        </Portal>
      ) : undefined}
      {rules.length > 0 && (
        <ProgressionExample exercise={props.exercise} open={exampleOpen} onDismiss={() => setExampleOpen(false)} />
      )}
    </View>
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
  const { colors } = useAppTheme();
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

  return (
    <View>
      {/*
       * Always offered, even where the exercise carries no load to move. Turning the load off leaves
       * any load rule behind it inert, and hiding the axis would leave a rule on screen doing nothing
       * with no way to say what it should do instead.
       */}
      <Row label={t('exercise.progression.axis.label')}>
        <SelectPicker
          value={rule.axis}
          options={axisOptions}
          onChange={(axis) =>
            props.onChange(axisFor(rule, axis, props.hasLaterRule ? props.defaultCeiling : undefined))
          }
        />
      </Row>
      {rule.axis === 'load' && !props.canMoveLoad && (
        <AppText variant="bodySmall" style={{ color: colors.error }}>
          {t('exercise.progression.axis.no_load.body')}
        </AppText>
      )}

      <Row
        label={
          rule.axis === 'reps'
            ? t('exercise.progression.step.reps.label')
            : t('exercise.progressive_overload.increase_all_evenly.amount.label')
        }
      >
        {rule.axis === 'reps' ? (
          <IntegerInput
            minWidth={spacing[20]}
            value={rule.step.toNumber()}
            onChange={(step) => props.onChange(rule.with({ step: BigNumber(step) }))}
            accessibilityLabel={t('exercise.progression.step.reps.label')}
          />
        ) : (
          <DecimalInput
            minWidth={spacing[20]}
            value={rule.step}
            onChange={(step) => props.onChange(rule.with({ step }))}
            accessibilityLabel={t('exercise.progressive_overload.increase_all_evenly.amount.label')}
          />
        )}
      </Row>

      <Row label={t('exercise.progression.scope.label')}>
        <SelectPicker
          value={scopeChoiceOf(rule.scope)}
          options={scopeOptions}
          onChange={(choice) => props.onChange(rule.with({ scope: scopeOf(choice) }))}
        />
      </Row>

      {rule.axis === 'reps' && (
        <>
          <SwitchRow
            value={rule.ceiling !== undefined}
            label={t('exercise.progression.ceiling.title')}
            description={t('exercise.progression.ceiling.body')}
            onValueChange={(on) => props.onChange(rule.with({ ceiling: on ? props.defaultCeiling : undefined }))}
          />
          {rule.ceiling !== undefined && (
            <Row label={t('exercise.progression.ceiling.label')}>
              <IntegerInput
                minWidth={spacing[20]}
                value={rule.ceiling.toNumber()}
                onChange={(ceiling) => props.onChange(rule.with({ ceiling: BigNumber(ceiling) }))}
                accessibilityLabel={t('exercise.progression.ceiling.label')}
              />
            </Row>
          )}
          {/* Only means anything with somewhere to hand over to; on its own it would never fire. */}
          {rule.ceiling !== undefined && props.hasLaterRule && (
            <SwitchRow
              value={rule.onCeiling === 'reset'}
              label={t('exercise.progression.reset.title')}
              description={t('exercise.progression.reset.body')}
              onValueChange={(on) => props.onChange(rule.with({ onCeiling: on ? 'reset' : undefined }))}
            />
          )}
        </>
      )}
    </View>
  );
}

function SwitchRow(props: { label: string; description: string; value: boolean; onValueChange: (v: boolean) => void }) {
  const { colors } = useAppTheme();
  return (
    <TouchableRipple onPress={() => props.onValueChange(!props.value)}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[4], paddingBlock: spacing[2] }}>
        <View style={{ flex: 1, gap: spacing[0.5] }}>
          <AppText>{props.label}</AppText>
          <AppText variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {props.description}
          </AppText>
        </View>
        <Switch value={props.value} onValueChange={props.onValueChange} />
      </View>
    </TouchableRipple>
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

function Row(props: { label: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing[4],
        minHeight: spacing[11],
      }}
    >
      <AppText style={{ flexShrink: 1 }}>{props.label}</AppText>
      {props.children}
    </View>
  );
}

function ProgressionExample(props: { exercise: WeightedExerciseBlueprint; open: boolean; onDismiss: () => void }) {
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
    <Portal>
      <Dialog visible={props.open} onDismiss={props.onDismiss}>
        <Dialog.Title>{t('exercise.progressive_overload.example.label')}</Dialog.Title>
        <Dialog.Content style={{ height: 400 }}>
          <ScrollView contentContainerStyle={{ gap: spacing[4], alignItems: 'center' }} style={{ flex: 1 }}>
            {rungs.map((rung, index) => (
              <View key={index} style={{ gap: spacing[4], alignItems: 'center' }}>
                {index > 0 && <Icon source={'arrowDownward'} size={24} />}
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
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={props.onDismiss}>{t('generic.ok.button')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
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
