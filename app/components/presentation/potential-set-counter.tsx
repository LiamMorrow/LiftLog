import { PotentialSet } from '@/models/session-models';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { TouchableRipple } from 'react-native-paper';
import { Text, Touchable, View } from 'react-native';
import WeightFormat from '@/components/presentation/weight-format';
import WeightDialog from '@/components/presentation/weight-dialog';
import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import { PressableProps } from 'react-native-paper/lib/typescript/components/TouchableRipple/Pressable';
import FocusRing from '@/components/presentation/focus-ring';
import Animated from 'react-native-reanimated';
import { WeightAppliesTo } from '@/store/current-session';
import SelectButton, {
  SelectButtonOption,
} from '@/components/presentation/select-button';
import { useTranslate } from '@tolgee/react';
import Holdable from '@/components/presentation/holdable';

interface PotentialSetCounterProps {
  set: PotentialSet;
  showWeight: boolean;
  weightIncrement: BigNumber;
  maxReps: number;
  toStartNext: boolean;
  isReadonly: boolean;

  onTap: () => void;
  onHold: () => void;
  onUpdateWeight: (weight: BigNumber, applyTo: WeightAppliesTo) => void;
}

export default function PotentialSetCounter(props: PotentialSetCounterProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const repCountValue = props.set?.set?.repsCompleted;

  const applyToSelections: SelectButtonOption<WeightAppliesTo>[] = [
    {
      label: t('Apply to uncompleted sets'),
      value: 'uncompletedSets',
    },
    {
      label: t('Apply to all sets'),
      value: 'allSets',
    },
    {
      label: t('Apply to this set'),
      value: 'thisSet',
    },
  ];

  const callbacks = props.isReadonly
    ? {}
    : ({
        onPress: props.onTap,
        // We use holdable long press so we don't want long press triggering onPress
        onLongPress: () => {},
      } satisfies Touchable & Omit<PressableProps, 'children'>);

  const [applyTo, setApplyTo] = useState<WeightAppliesTo>('uncompletedSets');

  useEffect(() => {
    if (props.set.set) {
      setApplyTo('thisSet');
    } else {
      setApplyTo('uncompletedSets');
    }
  }, [props.set.set]);

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
          <Animated.View
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
              {...callbacks}
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
          </Animated.View>
          <Animated.View
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
                props.isReadonly
                  ? undefined!
                  : () => setIsWeightDialogOpen(true)
              }
              // We use holdable long press so we don't want long press triggering onPress
              onLongPress={() => {}}
              disabled={props.isReadonly}
            >
              <Text style={{ color: colors.onSurface, ...font['text-sm'] }}>
                <WeightFormat weight={props.set.weight} />
              </Text>
            </TouchableRipple>
          </Animated.View>
          <WeightDialog
            open={isWeightDialogOpen}
            increment={props.weightIncrement}
            weight={props.set.weight}
            onClose={() => setIsWeightDialogOpen(false)}
            updateWeight={(w) => props.onUpdateWeight(w, applyTo)}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SelectButton
                testID="repcount-apply-weight-to"
                value={applyTo}
                onChange={setApplyTo}
                options={applyToSelections}
              />
            </View>
          </WeightDialog>
        </View>
      </FocusRing>
    </Holdable>
  );
}
