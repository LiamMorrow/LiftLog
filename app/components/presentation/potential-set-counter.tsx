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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import {
  endIncreasingHoldHaptics,
  startIncreasingHoldHaptics,
} from '@/store/app';
import { WeightAppliesTo } from '@/store/current-session';
import SelectButton, {
  SelectButtonOption,
} from '@/components/presentation/select-button';
import { useTranslate } from '@tolgee/react';

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
  const holdingScale = useSharedValue(1);
  const { t } = useTranslate();
  const [isHolding, setIsHolding] = useState(false);
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const repCountValue = props.set?.set?.repsCompleted;
  const dispatch = useDispatch();

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

  useEffect(() => {
    holdingScale.value = withTiming(isHolding ? 1.1 : 1, {
      duration: 400,
    });
  }, [holdingScale, isHolding]);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: holdingScale.value }],
  }));

  const enterHold = () => {
    setIsHolding(true);
    dispatch(startIncreasingHoldHaptics());
  };
  const exitHold = () => {
    setIsHolding(false);
    dispatch(endIncreasingHoldHaptics({ completedHold: false }));
  };

  const callbacks = props.isReadonly
    ? {}
    : ({
        onPress: props.onTap,
        onLongPress: () => {
          dispatch(endIncreasingHoldHaptics({ completedHold: true }));
          props.onHold();
        },
        onTouchStart: enterHold,
        onPointerDown: enterHold,
        onPointerUp: exitHold,
        onPointerLeave: exitHold,
        onTouchEnd: exitHold,
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
    <FocusRing isSelected={props.toStartNext} radius={15}>
      <Animated.View
        style={[
          scaleStyle,
          {
            userSelect: 'none',
            minWidth: spacing[16],
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
              height: spacing[16],
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                repCountValue !== undefined
                  ? colors.primary
                  : colors.secondaryContainer,
            }}
            {...callbacks}
            disabled={props.isReadonly}
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
              <Text style={{ fontWeight: 'bold' }}>{repCountValue ?? '-'}</Text>
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
            style={{
              alignItems: 'center',
              margin: -spacing[2],
              padding: spacing[2],
            }}
            onPress={
              props.isReadonly ? undefined! : () => setIsWeightDialogOpen(true)
            }
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
              value={applyTo}
              onChange={setApplyTo}
              options={applyToSelections}
            />
          </View>
        </WeightDialog>
      </Animated.View>
    </FocusRing>
  );
}
