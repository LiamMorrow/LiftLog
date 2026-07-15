import FixedIncrementer from '@/components/presentation/foundation/editors/fixed-incrementer';
import { FormRow } from '@/components/presentation/foundation/form-row';
import RestFormat from '@/components/presentation/foundation/rest-format';
import SegmentedPicker from '@/components/presentation/foundation/segmented-picker';
import { SegmentedList, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSwitch } from '@/components/presentation/foundation/segmented-list-switch';
import { RestEditorDialog } from '@/components/presentation/workout-editor/rest-editor-dialog';
import {
  ProgressiveOverloadSelect,
  ProgressiveOverloadValuesEditor,
} from '@/components/presentation/workout-editor/progressive-overload';
import { SharedFieldsEditor } from '@/components/presentation/workout-editor/shared-fields-editor';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ExerciseBlueprint, RepsConfig, RepsType, WeightedExerciseBlueprint } from '@/models/blueprint-models';
import { useAppSelector } from '@/store';
import { ExtractType } from '@/utils/extract-type';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';

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
  const [restDialogOpen, setRestDialogOpen] = useState(false);

  const mode = exercise.repsConfig.type;

  const setSets = (value: number) => {
    updateExercise(exercise.withSets(value));
  };

  const setMode = (next: RepsType) => {
    if (next === mode) {
      return;
    }
    updateExercise(exercise.withRepsConfigType(next));
  };

  return (
    <View style={{ gap: spacing[2] }}>
      <SegmentedPicker
        value={mode}
        options={[
          { value: 'fixed', label: 'Fixed', testID: 'reps-mode-fixed' },
          { value: 'range', label: 'Range', testID: 'reps-mode-range' },
          { value: 'perSet', label: 'Per set', testID: 'reps-mode-per-set' },
        ]}
        onChange={setMode}
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          width: '100%',
          gap: spacing[4],
          marginBlockEnd: spacing[2],
        }}
      >
        <View style={{ flex: 1 }}>
          <FixedIncrementer
            label={t('exercise.sets.label')}
            onValueChange={setSets}
            value={exercise.sets}
            testID="exercise-sets"
          />
        </View>
        {mode === 'perSet' ? (
          <PerSetRepsEditor
            repsConfig={exercise.repsConfig}
            setRepsConfig={(repsConfig) => updateExercise(exercise.with({ repsConfig }))}
          />
        ) : mode === 'range' ? (
          <RangeRepsEditor
            repsConfig={exercise.repsConfig}
            setRepsConfig={(repsConfig) => updateExercise(exercise.with({ repsConfig }))}
          />
        ) : (
          <FixedRepsEditor
            repsConfig={exercise.repsConfig}
            setRepsConfig={(repsConfig) => updateExercise(exercise.with({ repsConfig }))}
          />
        )}
      </View>

      <SharedFieldsEditor exercise={exercise} updateExercise={updateExercise} />

      {restTimersEnabled && (
        <RestEditorDialog
          onRestUpdated={(restBetweenSets) => updateExercise({ restBetweenSets })}
          rest={exercise.restBetweenSets}
          dialogOpen={restDialogOpen}
          setDialogOpen={setRestDialogOpen}
        />
      )}
      <FormRow>
        <SegmentedList
          items={[
            ...(restTimersEnabled
              ? [
                  <SegmentListFormElement
                    key={1}
                    label={t('rest.rest.label')}
                    icon={'airlineSeatReclineExtraFill'}
                    onPress={() => setRestDialogOpen(true)}
                    right={<RestFormat style={{ color: colors.onSurface }} rest={exercise.restBetweenSets} />}
                  />,
                ]
              : []),
            <SegmentedListSwitch
              key={2}
              label={t('workout.superset_next_exercise.button')}
              icon={'link'}
              value={exercise.supersetWithNext}
              testID="exercise-superset"
              onValueChange={(supersetWithNext) => updateExercise({ supersetWithNext })}
            />,
            <SegmentListFormElement
              key={3}
              label={t('exercise.progressive_overload.label')}
              icon={'trendingUp'}
              right={
                <ProgressiveOverloadSelect
                  value={exercise.progressiveOverload}
                  onChange={(progressiveOverload) => updateExercise({ progressiveOverload })}
                />
              }
              line2={
                <ProgressiveOverloadValuesEditor
                  value={exercise.progressiveOverload}
                  onChange={(progressiveOverload) => updateExercise({ progressiveOverload })}
                />
              }
            />,
          ]}
          renderItem={(i) => i}
        />
      </FormRow>
    </View>
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
