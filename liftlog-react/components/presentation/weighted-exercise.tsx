import ItemTitle from '@/components/presentation/item-title';
import PotentialSetCounter from '@/components/presentation/potential-set-counter';
import { useAppTheme } from '@/hooks/useAppTheme';
import { RecordedExercise } from '@/models/session-models';
import { DatedRecordedExercise } from '@/models/stats-models';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { IconButton, Menu } from 'react-native-paper';
import { useTranslate } from '@tolgee/react';
import { useAnimatedValue, Animated } from 'react-native';
import WeightDisplay from '@/components/presentation/weight-display';

interface WeightedExerciseProps {
  recordedExercise: RecordedExercise;
  previousRecordedExercises: DatedRecordedExercise[];
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;

  cycleRepCountForSet: (setIndex: number) => void;
  showAdditionalActionsForSet: (setIndex: number) => void;
  updateWeightForSet: (setIndex: number, weight: BigNumber) => void;
  updateWeightForExercise: (weight: BigNumber) => void;
  updateNotesForExercise: (notes: string) => void;
  onOpenLink: (link: string) => void;
  onEditExercise: () => void;
  togglePerSepWeight: () => void;
  onRemoveExercise: () => void;
}

function AnimatedWeightDisplay(
  props: Pick<
    WeightedExerciseProps,
    'isReadonly' | 'recordedExercise' | 'updateWeightForExercise'
  >,
) {
  const { recordedExercise } = props;
  const { spacing } = useAppTheme();
  const sizeAnimatedValue = useAnimatedValue(1);

  useEffect(() => {
    Animated.timing(sizeAnimatedValue, {
      toValue: recordedExercise.perSetWeight ? 0 : 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [recordedExercise.perSetWeight, sizeAnimatedValue]);

  return (
    <Animated.View
      style={{
        alignSelf: 'flex-start',
        height: sizeAnimatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, spacing[14]],
        }),
        margin: sizeAnimatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -spacing[3]],
        }),
        marginTop: sizeAnimatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -spacing[4]],
        }),
        overflow: recordedExercise.perSetWeight ? 'hidden' : undefined,
      }}
    >
      <WeightDisplay
        increment={recordedExercise.blueprint.weightIncreaseOnSuccess}
        updateWeight={props.updateWeightForExercise}
        weight={RecordedExercise.maxWeight(recordedExercise)}
        isReadonly={props.isReadonly}
      />
    </Animated.View>
  );
}

export default function WeightedExercise(props: WeightedExerciseProps) {
  const { t } = useTranslate();
  const { recordedExercise } = props;
  const { colors, spacing } = useAppTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [editorNotes, setEditorNotes] = useState(recordedExercise.notes ?? '');
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  var setToStartNext = recordedExercise.potentialSets.findIndex((x) => !x.set);

  const showPrevious = () => {};
  const interactiveButtons = props.isReadonly ? (
    <View style={{ height: 40 }}></View>
  ) : (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-end',
      }}
    >
      {props.showPreviousButton ? (
        <IconButton
          data-cy="prev-exercise-btn"
          icon={'history'}
          onPress={showPrevious}
        />
      ) : null}
      <IconButton
        data-cy="per-rep-weight-btn"
        icon={'weight'}
        onPress={props.togglePerSepWeight}
      />

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <IconButton
            data-cy="more-exercise-btn"
            onPress={() => setMenuVisible(true)}
            icon="dots-horizontal"
          />
        }
      >
        <Menu.Item
          onPress={() => {
            props.onEditExercise();
            setMenuVisible(false);
          }}
          leadingIcon="pencil"
          title={t('Edit')}
        />
        <Menu.Item
          data-cy="exercise-notes-btn"
          title={t('Notes')}
          leadingIcon="text"
          onPress={() => {
            setEditorNotes(recordedExercise.notes ?? '');
            setNotesDialogOpen(true);
            setMenuVisible(false);
          }}
        />
        <Menu.Item
          onPress={props.onRemoveExercise}
          leadingIcon="delete"
          title={t('Remove')}
        />
      </Menu>
    </View>
  );
  return (
    <View
      style={{
        flexDirection: 'column',
        gap: spacing[4],
        paddingBlock: spacing[4],
        paddingLeft: spacing[7],
        paddingRight: spacing[2],
        width: '100%',
      }}
      data-cy="weighted-exercise"
    >
      <View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <ItemTitle title={recordedExercise.blueprint.name} />
          {interactiveButtons}
        </View>
        <AnimatedWeightDisplay {...props} />
        <View
          style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}
        >
          {recordedExercise.potentialSets.map((set, index) => (
            <PotentialSetCounter
              isReadonly={props.isReadonly}
              key={index}
              maxReps={recordedExercise.blueprint.repsPerSet}
              onTap={() => props.cycleRepCountForSet(index)}
              onHold={() => props.showAdditionalActionsForSet(index)}
              onUpdateWeight={(w) => props.updateWeightForSet(index, w)}
              set={set}
              showWeight={recordedExercise.perSetWeight}
              toStartNext={
                props.toStartNext &&
                setToStartNext === index &&
                !props.isReadonly
              }
              weightIncrement={
                recordedExercise.blueprint.weightIncreaseOnSuccess
              }
            />
          ))}
        </View>
      </View>
    </View>
  );
}
