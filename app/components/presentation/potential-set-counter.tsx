import { PotentialSet } from '@/models/session-models';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { Text as PaperText, Chip } from 'react-native-paper';
import { Text, View } from 'react-native';
import WeightFormat from '@/components/presentation/weight-format';
import WeightDialog from '@/components/presentation/weight-dialog';
import { useAppTheme, spacing, font, rounding } from '@/hooks/useAppTheme';
import FocusRing from '@/components/presentation/focus-ring';
import { WeightAppliesTo } from '@/store/current-session';
import { T } from '@tolgee/react';
import Holdable from '@/components/presentation/holdable';
import TouchableRipple from '@/components/presentation/gesture-wrappers/touchable-ripple';
import { Weight } from '@/models/weight';
import PotentialSetAdditionalActionsDialog from '@/components/presentation/potential-sets-addition-actions-dialog';

interface PotentialSetCounterProps {
  set: PotentialSet;
  showWeight: boolean;
  weightIncrement: BigNumber;
  maxReps: number;
  toStartNext: boolean;
  isReadonly: boolean;

  onTap: () => void;
  onUpdateWeight: (weight: Weight, applyTo: WeightAppliesTo) => void;
  onUpdateReps: (reps: number | undefined) => void;
}

export default function PotentialSetCounter(props: PotentialSetCounterProps) {
  const { colors } = useAppTheme();
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const [isRepsDialogOpen, setIsRepsDialogOpen] = useState(false);
  const repCountValue = props.set?.set?.repsCompleted;

  const [applyTo, setApplyTo] = useState<WeightAppliesTo>('uncompletedSets');

  return (
    <Holdable onLongPress={() => setIsRepsDialogOpen(true)}>
      <FocusRing
        isSelected={props.toStartNext}
        radius={rounding.roundedRectangleFocusRingRadius}
      >
        <View
          style={[
            {
              userSelect: 'none',
              minWidth: spacing[15],
            },
          ]}
        >
          <View
            style={[
              {
                borderTopLeftRadius: rounding.roundedRectangleRadius,
                borderTopRightRadius: rounding.roundedRectangleRadius,
                overflow: 'hidden',
              },
            ]}
          >
            <TouchableRipple
              style={{
                flexShrink: 0,
                padding: 0,
                height: spacing[15],
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  repCountValue !== undefined
                    ? colors.primary
                    : colors.secondaryContainer,
              }}
              onPress={props.isReadonly ? undefined : props.onTap}
              disabled={props.isReadonly}
              testID="repcount"
            >
              <Text
                style={{
                  color:
                    repCountValue !== undefined
                      ? colors.onPrimary
                      : colors.onSecondaryContainer,
                  ...font['text-xl'],
                }}
              >
                <Text style={{ fontWeight: 'bold' }}>
                  {repCountValue ?? '-'}
                </Text>
                <Text
                  style={{
                    ...font['text-sm'],
                    verticalAlign: 'top',
                  }}
                >
                  /{props.maxReps}
                </Text>
              </Text>
            </TouchableRipple>
          </View>
          <View
            style={{
              borderTopWidth: 1,
              borderColor: colors.outline,
              backgroundColor: colors.surfaceContainerHigh,
              borderBottomLeftRadius: rounding.roundedRectangleRadius,
              borderBottomRightRadius: rounding.roundedRectangleRadius,
              overflow: 'hidden',
              padding: spacing[2],
              width: '100%',
            }}
          >
            <TouchableRipple
              testID="repcount-weight"
              style={{
                alignItems: 'center',
                margin: -spacing[2],
                padding: spacing[2],
              }}
              onPress={
                props.isReadonly
                  ? undefined
                  : () => {
                      setApplyTo(props.set.set ? 'thisSet' : 'uncompletedSets');
                      setIsWeightDialogOpen(true);
                    }
              }
              disabled={props.isReadonly}
            >
              <Text style={{ color: colors.onSurface, ...font['text-sm'] }}>
                <WeightFormat weight={props.set.weight} />
              </Text>
            </TouchableRipple>
          </View>
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
        </View>
      </FocusRing>

      <PotentialSetAdditionalActionsDialog
        open={isRepsDialogOpen}
        repTarget={props.maxReps}
        set={props.set}
        updateRepCount={(reps) => props.onUpdateReps(reps)}
        close={() => setIsRepsDialogOpen(false)}
      />
    </Holdable>
  );
}
