import AirlineSeatReclineExtraIcon from '@expo/material-symbols/airline_seat_recline_extra.xml';
import DirectionsRunIcon from '@expo/material-symbols/directions_run.xml';
import LinkIcon from '@expo/material-symbols/link.xml';
import FixedIncrementer from '@/components/presentation/foundation/editors/fixed-incrementer';
import RestFormat from '@/components/presentation/foundation/rest-format';
import SegmentedPicker from '@/components/presentation/foundation/segmented-picker';
import { SegmentedGroup, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { TitledSection } from '@/components/presentation/foundation/titled-section';
import { SegmentedListSelect } from '@/components/presentation/foundation/segmented-list-select';
import { SegmentedListSwitch } from '@/components/presentation/foundation/segmented-list-switch';
import { useRouteEditor } from '@/hooks/useRouteEditor';
import { ProgressionRulesEditor } from '@/components/presentation/workout-editor/progressive-overload';
import { SharedFieldsEditor } from '@/components/presentation/workout-editor/shared-fields-editor';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import {
  ExerciseBlueprint,
  Resistance,
  Rest,
  RepsConfig,
  RepsType,
  uniformTarget,
  WeightedExerciseBlueprint,
} from '@/models/blueprint-models';
import { useAppSelector } from '@/store';
import { ExtractType } from '@/utils/extract-type';
import { TranslationKey, useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';

/**
 * What each choice actually changes, since "resistance" names the field without saying what picking one
 * does to the set counter or to the stats built off it.
 */
const resistanceOptions = [
  {
    value: 'external',
    label: 'exercise.resistance.external.label',
    body: 'exercise.resistance.external.body',
  },
  {
    value: 'bodyweight',
    label: 'exercise.resistance.bodyweight.label',
    body: 'exercise.resistance.bodyweight.body',
  },
  { value: 'none', label: 'exercise.resistance.none.label', body: 'exercise.resistance.none.body' },
] as const satisfies { value: Resistance; label: TranslationKey; body: TranslationKey }[];

export function WeightedExerciseEditor({
  exercise,
  updateExercise,
}: {
  exercise: WeightedExerciseBlueprint;
  updateExercise: (ex: Partial<ExerciseBlueprint>) => void;
}) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const restTimersEnabled = useAppSelector((x) => x.settings.restTimersEnabled);
  const openRouteEditor = useRouteEditor((restBetweenSets: Rest) => updateExercise({ restBetweenSets }));

  // Only the targets persist, so a uniform list cannot say whether it was authored as fixed or as a
  // range; the chosen mode lives here for as long as the editor is open.
  const [mode, setMode] = useState<RepsType>(() => initialMode(exercise));
  const repsConfig = repsConfigFor(exercise, mode);

  const setRepsConfig = (next: RepsConfig) => {
    updateExercise(exercise.with({ sets: exercise.plannedSets.length, repsConfig: next }));
  };

  const changeMode = (next: RepsType) => {
    if (next === mode) {
      return;
    }
    setMode(next);
    setRepsConfig(seedRepsConfig(exercise, next));
  };

  return (
    <>
      <TitledSection title={t('exercise.sets_and_reps.title')}>
        <SegmentedPicker
          value={mode}
          options={[
            { value: 'fixed', label: 'Fixed', testID: 'reps-mode-fixed' },
            { value: 'range', label: 'Range', testID: 'reps-mode-range' },
            { value: 'perSet', label: 'Per set', testID: 'reps-mode-per-set' },
          ]}
          onChange={changeMode}
        />
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', width: '100%', gap: spacing[4] }}>
          <View style={{ flex: 1 }}>
            <FixedIncrementer
              label={t('exercise.sets.label')}
              onValueChange={(value) => updateExercise(exercise.withSets(value))}
              value={exercise.plannedSets.length}
              testID="exercise-sets"
            />
          </View>
          {repsConfig.type === 'perSet' ? (
            <PerSetRepsEditor repsConfig={repsConfig} setRepsConfig={setRepsConfig} />
          ) : repsConfig.type === 'range' ? (
            <RangeRepsEditor repsConfig={repsConfig} setRepsConfig={setRepsConfig} />
          ) : (
            <FixedRepsEditor repsConfig={repsConfig} setRepsConfig={setRepsConfig} />
          )}
        </View>
      </TitledSection>

      <TitledSection title={restTimersEnabled ? t('exercise.between_sets.title') : t('workout.superset.label')}>
        <SegmentedGroup>
          {restTimersEnabled ? (
            <SegmentListFormElement
              key="rest"
              label={t('rest.rest.label')}
              icon={AirlineSeatReclineExtraIcon}
              systemImage="chair.lounge"
              onPress={() => openRouteEditor('/rest-editor', exercise.restBetweenSets)}
              right={<RestFormat style={{ color: colors.onSurface }} rest={exercise.restBetweenSets} />}
            />
          ) : undefined}
          <SegmentedListSwitch
            key="superset"
            label={t('workout.superset_next_exercise.button')}
            icon={LinkIcon}
            systemImage="link"
            value={exercise.supersetWithNext}
            testID="exercise-superset"
            onValueChange={(supersetWithNext) => updateExercise({ supersetWithNext })}
          />
        </SegmentedGroup>
      </TitledSection>

      <SharedFieldsEditor exercise={exercise} updateExercise={updateExercise} />

      <TitledSection title={t('exercise.progressive_overload.label')}>
        <ProgressionRulesEditor exercise={exercise} onChange={(progression) => updateExercise({ progression })} />
      </TitledSection>
    </>
  );
}

export function ResistanceSelect({
  exercise,
  updateExercise,
}: {
  exercise: WeightedExerciseBlueprint;
  updateExercise: (ex: Partial<ExerciseBlueprint>) => void;
}) {
  const { t } = useTranslate();
  return (
    <SegmentedListSelect
      label={t('exercise.resistance.label')}
      icon={DirectionsRunIcon}
      systemImage="figure.run"
      testID="load-basis"
      value={exercise.resistance}
      options={resistanceOptions.map(({ value, label }) => ({ value, label: t(label) }))}
      onChange={(resistance: Resistance) => updateExercise({ resistance })}
      supportingText={t(resistanceOptions.find((option) => option.value === exercise.resistance)!.body)}
    />
  );
}

function RangeRepsEditor({
  repsConfig,
  setRepsConfig,
}: {
  repsConfig: ExtractType<RepsConfig, 'range'>;
  setRepsConfig: (config: RepsConfig) => void;
}) {
  const { t } = useTranslate();
  return (
    <>
      <View style={{ flex: 1 }}>
        <FixedIncrementer
          label={t('exercise.min_reps.label')}
          onValueChange={(min) =>
            setRepsConfig({ ...repsConfig, min: Math.max(min, 1), max: Math.max(repsConfig.max, min) })
          }
          value={repsConfig.min}
          testID="exercise-min-reps"
        />
      </View>
      <View style={{ flex: 1 }}>
        <FixedIncrementer
          label={t('exercise.max_reps.label')}
          onValueChange={(max) => setRepsConfig({ ...repsConfig, max: Math.max(max, repsConfig.min) })}
          value={repsConfig.max}
          testID="exercise-max-reps"
        />
      </View>
    </>
  );
}

function FixedRepsEditor({
  repsConfig,
  setRepsConfig,
}: {
  repsConfig: ExtractType<RepsConfig, 'fixed'>;
  setRepsConfig: (config: RepsConfig) => void;
}) {
  const { t } = useTranslate();
  return (
    <View style={{ flex: 1 }}>
      <FixedIncrementer
        label={t('exercise.reps.label')}
        onValueChange={(reps) => setRepsConfig({ ...repsConfig, reps: Math.max(reps, 1) })}
        value={repsConfig.reps}
        testID="exercise-reps"
      />
    </View>
  );
}

function PerSetRepsEditor({
  repsConfig,
  setRepsConfig,
}: {
  repsConfig: ExtractType<RepsConfig, 'perSet'>;
  setRepsConfig: (config: RepsConfig) => void;
}) {
  const { t } = useTranslate();

  const setSetReps = (index: number, value: number) => {
    const reps = Math.max(value, 1);
    setRepsConfig({
      type: 'perSet',
      targets: repsConfig.targets.map((target, i) => (i === index ? { min: reps, max: reps } : target)),
    });
  };

  return (
    <View style={{ flex: 3, flexDirection: 'row', flexWrap: 'wrap', gap: spacing[4] }}>
      {repsConfig.targets?.map((target, index) => (
        <View key={index} style={{ flexGrow: 1, flexBasis: '25%', minWidth: spacing[16] }}>
          <FixedIncrementer
            label={t('exercise.set_number.label', { number: index + 1 })}
            onValueChange={(value) => setSetReps(index, value)}
            value={target.max}
            testID={`exercise-set-reps-${index}`}
          />
        </View>
      ))}
    </View>
  );
}

/** The layout the stored targets most likely came from, used to seed the editor's mode. */
function initialMode(exercise: WeightedExerciseBlueprint): RepsType {
  const uniform = uniformTarget(exercise.plannedSets);
  if (!uniform) {
    return 'perSet';
  }
  return uniform.min === uniform.max ? 'fixed' : 'range';
}

function repsConfigFor(exercise: WeightedExerciseBlueprint, mode: RepsType): RepsConfig {
  const targets = exercise.plannedSets.map((s) => ({ ...s.reps }));
  const first = targets[0] ?? { min: 10, max: 10 };
  return mode === 'perSet'
    ? { type: 'perSet', targets }
    : mode === 'range'
      ? { type: 'range', min: first.min, max: first.max }
      : { type: 'fixed', reps: first.max };
}

function seedRepsConfig(exercise: WeightedExerciseBlueprint, mode: RepsType): RepsConfig {
  const target = exercise.repsTargetForSet(0);
  return mode === 'perSet'
    ? { type: 'perSet', targets: exercise.plannedSets.map(() => ({ min: target.max, max: target.max })) }
    : mode === 'range'
      ? { type: 'range', min: target.min, max: target.max }
      : { type: 'fixed', reps: target.min };
}
