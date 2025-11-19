import { PotentialSet } from '@/models/session-models';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { Text as PaperText, Chip } from 'react-native-paper';
import { Text, View } from 'react-native';
import WeightFormat from '@/components/presentation/weight-format';
import WeightDialog from '@/components/presentation/weight-dialog';
import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import FocusRing from '@/components/presentation/focus-ring';
import { WeightAppliesTo } from '@/store/current-session';
import { T } from '@tolgee/react';
import Holdable from '@/components/presentation/holdable';
import TouchableRipple from '@/components/presentation/gesture-wrappers/touchable-ripple';
import { Weight } from '@/models/weight';

interface PotentialSetCounterProps {
  set: PotentialSet;
  showWeight: boolean;
  weightIncrement: BigNumber;
  maxReps: number;
  toStartNext: boolean;
  isReadonly: boolean;

  onTap: () => void;
  onHold: () => void;
  onUpdateWeight: (weight: Weight, applyTo: WeightAppliesTo) => void;
}

export default function PotentialSetCounter(props: PotentialSetCounterProps) {
  const { colors } = useAppTheme();
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const repCountValue = props.set?.set?.repsCompleted;

  const [applyTo, setApplyTo] = useState<WeightAppliesTo>('thisSet');

  return (
    <Holdable onLongPress={props.onHold}>
      <FocusRing isSelected={props.toStartNext} radius={15}>
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
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
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
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
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
                props.isReadonly ? undefined : () => setIsWeightDialogOpen(true)
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
                <T keyName="Apply weight to" />
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
                  <T keyName="This set" />
                </Chip>
                <Chip
                  selected={applyTo === 'uncompletedSets'}
                  testID="repcount-apply-weight-to-uncompleted-sets"
                  onPress={() => setApplyTo('uncompletedSets')}
                >
                  <T keyName="Uncompleted sets" />
                </Chip>
                <Chip
                  selected={applyTo === 'allSets'}
                  testID="repcount-apply-weight-to-all-sets"
                  onPress={() => setApplyTo('allSets')}
                >
                  <T keyName="All sets" />
                </Chip>
              </View>
            </View>
          </WeightDialog>
        </View>
      </FocusRing>
    </Holdable>
  );
}
