import { PotentialSet, WeightAppliesTo } from '@/models/session-models';
import { RepsTarget } from '@/models/blueprint-models';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { Text as PaperText, Chip } from 'react-native-paper';
import { Keyboard, View } from 'react-native';
import WeightDialog from '@/components/presentation/foundation/editors/weight-dialog';
import { spacing, rounding } from '@/hooks/useAppTheme';
import FocusRing from '@/components/presentation/foundation/focus-ring';
import { T } from '@tolgee/react';
import Holdable from '@/components/presentation/foundation/holdable';
import { Weight } from '@/models/weight';
import PotentialSetAdditionalActionsDialog from '@/components/presentation/workout/weighted/potential-sets-addition-actions-dialog';
import { PotentialSetDisplay } from '@/components/presentation/workout/weighted/potential-set-display';

interface PotentialSetCounterProps {
  set: PotentialSet;
  weightIncrement: BigNumber;
  repsTarget: RepsTarget;
  previousRepCount: number | undefined;
  toStartNext: boolean;
  isReadonly: boolean;
  usesBodyweight: boolean;

  onTap: () => void;
  onUpdateWeight: (weight: Weight, applyTo: WeightAppliesTo) => void;
  onUpdateReps: (reps: number | undefined) => void;
}

export default function PotentialSetCounter(props: PotentialSetCounterProps) {
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const [isRepsDialogOpen, setIsRepsDialogOpen] = useState(false);
  const maxReps = props.repsTarget.max;

  useEffect(() => {
    if (!isRepsDialogOpen) {
      Keyboard.dismiss();
    }
  }, [isRepsDialogOpen]);
  const [applyTo, setApplyTo] = useState<WeightAppliesTo>('uncompletedSets');

  return (
    <Holdable disabled={props.isReadonly} onLongPress={() => setIsRepsDialogOpen(true)}>
      <FocusRing isSelected={props.toStartNext} radius={rounding.roundedRectangleFocusRingRadius}>
        <PotentialSetDisplay
          set={props.set}
          repsTarget={props.repsTarget}
          usesBodyweight={props.usesBodyweight}
          previousRepCount={props.previousRepCount}
          onPressReps={props.isReadonly ? undefined : props.onTap}
          onPressWeight={
            props.isReadonly
              ? undefined
              : () => {
                  setApplyTo(props.set.set ? 'thisSet' : 'uncompletedSets');
                  setIsWeightDialogOpen(true);
                }
          }
        />
        <WeightDialog
          open={isWeightDialogOpen}
          allowNegative
          increment={props.weightIncrement}
          weight={props.set.weight}
          onClose={() => setIsWeightDialogOpen(false)}
          updateWeight={(w) => props.onUpdateWeight(w, applyTo)}
        >
          <View style={{ gap: spacing[2] }}>
            <PaperText variant="labelLarge">
              <T keyName="weight.apply_to.label" />
            </PaperText>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: spacing[1],
              }}
            >
              <Chip
                selected={applyTo === 'thisSet'}
                testID="repcount-apply-weight-to-this-set"
                onPress={() => setApplyTo('thisSet')}
              >
                <T keyName="exercise.this_set.label" />
              </Chip>
              <Chip
                selected={applyTo === 'uncompletedSets'}
                testID="repcount-apply-weight-to-uncompleted-sets"
                onPress={() => setApplyTo('uncompletedSets')}
              >
                <T keyName="exercise.uncompleted_sets.label" />
              </Chip>
              <Chip
                selected={applyTo === 'allSets'}
                testID="repcount-apply-weight-to-all-sets"
                onPress={() => setApplyTo('allSets')}
              >
                <T keyName="exercise.all_sets.label" />
              </Chip>
            </View>
          </View>
        </WeightDialog>
      </FocusRing>

      <PotentialSetAdditionalActionsDialog
        open={isRepsDialogOpen}
        repTarget={maxReps}
        set={props.set}
        updateRepCount={(reps) => props.onUpdateReps(reps)}
        close={() => setIsRepsDialogOpen(false)}
      />
    </Holdable>
  );
}
