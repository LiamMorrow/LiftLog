import { PotentialSet, WeightAppliesTo } from '@/models/session-models';
import { Resistance, RepsTarget } from '@/models/blueprint-models';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslate } from '@tolgee/react';
import Holdable from '@/components/presentation/foundation/holdable';
import { Weight } from '@/models/weight';
import { PotentialSetDisplay } from '@/components/presentation/workout/weighted/potential-set-display';
import { DockedEditor } from '@/components/presentation/workout/edit-dock';
import { WeightEditor } from '@/components/presentation/foundation/editors/weight-editor';
import { NegateWeightButton } from '@/components/presentation/foundation/editors/weight-input-controls';
import SegmentedPicker from '@/components/presentation/foundation/segmented-picker';
import { ClearRepsButton, RepsEditor } from '@/components/presentation/workout/weighted/reps-editor';

interface PotentialSetCounterProps {
  set: PotentialSet;
  weightIncrement: BigNumber;
  repsTarget: RepsTarget;
  previousRepCount: number | undefined;
  toStartNext: boolean;
  isReadonly: boolean;
  resistance: Resistance;
  editorSubtitle?: string;
  hasRemainingSets?: boolean;

  onTap: () => void;
  onBeginWeightEdit?: () => void;
  onUpdateWeight: (weight: Weight, applyTo: WeightAppliesTo) => void;
  onUpdateReps: (reps: number | undefined) => void;
}

export default function PotentialSetCounter(props: PotentialSetCounterProps) {
  const { t } = useTranslate();
  const [editing, setEditing] = useState<'weight' | 'reps'>();
  const [applyTo, setApplyTo] = useState<WeightAppliesTo>('uncompletedSets');
  const close = () => setEditing(undefined);

  const changeApplyTo = (next: WeightAppliesTo) => {
    setApplyTo(next);
    props.onUpdateWeight(props.set.weight, next);
  };

  return (
    <Holdable disabled={props.isReadonly} onLongPress={() => setEditing('reps')}>
      <PotentialSetDisplay
        set={props.set}
        repsTarget={props.repsTarget}
        resistance={props.resistance}
        previousRepCount={props.previousRepCount}
        isNext={props.toStartNext}
        onPressReps={props.isReadonly ? undefined : props.onTap}
        onPressWeight={
          props.isReadonly
            ? undefined
            : () => {
                setApplyTo(props.set.set ? 'thisSet' : 'uncompletedSets');
                props.onBeginWeightEdit?.();
                setEditing('weight');
              }
        }
      />
      <DockedEditor
        open={editing === 'weight'}
        onClose={close}
        title={t('weight.weight.label')}
        subtitle={props.editorSubtitle}
        actions={() => (
          <NegateWeightButton weight={props.set.weight} onChange={(weight) => props.onUpdateWeight(weight, applyTo)} />
        )}
      >
        <WeightEditor
          allowNegative
          increment={props.weightIncrement}
          weight={props.set.weight}
          updateWeight={(weight) => props.onUpdateWeight(weight, applyTo)}
        />
        <SegmentedPicker
          value={applyTo}
          onChange={changeApplyTo}
          options={[
            {
              value: 'thisSet',
              label: t('exercise.this_set.label'),
              testID: 'repcount-apply-weight-to-this-set',
            },
            ...(props.hasRemainingSets
              ? [
                  {
                    value: 'uncompletedSets' as const,
                    label: t('exercise.remaining_sets.label'),
                    testID: 'repcount-apply-weight-to-uncompleted-sets',
                  },
                ]
              : []),
            {
              value: 'allSets',
              label: t('exercise.all_sets.label'),
              testID: 'repcount-apply-weight-to-all-sets',
            },
          ]}
        />
      </DockedEditor>
      <DockedEditor
        open={editing === 'reps'}
        onClose={close}
        title={t('exercise.reps.label')}
        subtitle={props.editorSubtitle}
        actions={(closeEditor) => (
          <ClearRepsButton
            onPress={() => {
              props.onUpdateReps(undefined);
              closeEditor();
            }}
          />
        )}
      >
        <RepsEditor
          reps={props.set.set?.repsCompleted}
          repTarget={props.repsTarget.max}
          onChange={props.onUpdateReps}
        />
      </DockedEditor>
    </Holdable>
  );
}
