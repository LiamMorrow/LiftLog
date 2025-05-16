import ItemTitle from '@/components/presentation/item-title';
import PotentialSetCounter from '@/components/presentation/potential-set-counter';
import { spacing } from '@/hooks/useAppTheme';
import { RecordedExercise } from '@/models/session-models';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  Dialog,
  Icon,
  IconButton,
  Menu,
  Portal,
  TextInput,
} from 'react-native-paper';
import { T, useTranslate } from '@tolgee/react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import PotentialSetAdditionalActionsDialog from '@/components/presentation/potential-sets-addition-actions-dialog';
import PreviousExerciseViewer from '@/components/presentation/previous-exercixe-viewer';
import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import WeightDisplay from '@/components/presentation/weight-display';
import { msIconSource } from '@/components/presentation/ms-icon-source';

interface WeightedExerciseProps {
  recordedExercise: RecordedExercise;
  previousRecordedExercises: RecordedExercise[];
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;

  cycleRepCountForSet: (setIndex: number) => void;
  updateRepCountForSet: (setIndex: number, reps: number | undefined) => void;
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

  const sizeAnimatedValue = useSharedValue(1);

  useEffect(() => {
    sizeAnimatedValue.value = withTiming(
      recordedExercise.perSetWeight ? 0 : 1,
      {
        duration: 150,
      },
    );
  }, [recordedExercise.perSetWeight, sizeAnimatedValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    alignSelf: 'flex-start',
    marginHorizontal: interpolate(
      sizeAnimatedValue.value,
      [0, 1],
      [-spacing[3], -spacing[3]],
    ),
    marginTop: interpolate(
      sizeAnimatedValue.value,
      [0, 1],
      [-spacing[9], -spacing[4]],
    ),
    marginBottom: interpolate(
      sizeAnimatedValue.value,
      [0, 1],
      [0, -spacing[1]],
    ),
    transform: [{ scale: sizeAnimatedValue.value }],
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          transformOrigin: 'bottom',
        },
      ]}
    >
      <WeightDisplay
        increment={recordedExercise.blueprint.weightIncreaseOnSuccess}
        updateWeight={props.updateWeightForExercise}
        weight={recordedExercise.maxWeight}
        isReadonly={props.isReadonly}
      />
    </Animated.View>
  );
}

export default function WeightedExercise(props: WeightedExerciseProps) {
  const { updateRepCountForSet, updateNotesForExercise, onRemoveExercise } =
    props;
  const { t } = useTranslate();
  const { recordedExercise } = props;
  const [menuVisible, setMenuVisible] = useState(false);
  const [editorNotes, setEditorNotes] = useState(recordedExercise.notes ?? '');
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [previousDialogOpen, setPreviousDialogOpen] = useState(false);
  const [removeExerciseDialogOpen, setRemoveExerciseDialogOpen] =
    useState(false);
  const [additionalPotentialSetIndex, setAdditionalPotentialSetIndex] =
    useState(-1);
  const setToStartNext = recordedExercise.potentialSets.findIndex(
    (x) => !x.set,
  );

  const showPrevious = () => {
    setPreviousDialogOpen(true);
  };

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
          icon={msIconSource('history')}
          onPress={showPrevious}
        />
      ) : null}
      <IconButton
        data-cy="per-rep-weight-btn"
        icon={msIconSource('weight')}
        onPress={props.togglePerSepWeight}
      />

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <IconButton
            data-cy="more-exercise-btn"
            onPress={() => setMenuVisible(true)}
            icon={msIconSource('moreHoriz')}
          />
        }
      >
        <Menu.Item
          onPress={() => {
            props.onEditExercise();
            setMenuVisible(false);
          }}
          leadingIcon={msIconSource('edit')}
          title={t('Edit')}
        />
        <Menu.Item
          data-cy="exercise-notes-btn"
          title={t('Notes')}
          leadingIcon={msIconSource('notes')}
          onPress={() => {
            setEditorNotes(recordedExercise.notes ?? '');
            setNotesDialogOpen(true);
            setMenuVisible(false);
          }}
        />
        <Menu.Item
          onPress={() => {
            setRemoveExerciseDialogOpen(true);
            setMenuVisible(false);
          }}
          leadingIcon={msIconSource('delete')}
          title={'Remove123'}
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
              onHold={() => setAdditionalPotentialSetIndex(index)}
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

      <PotentialSetAdditionalActionsDialog
        open={additionalPotentialSetIndex !== -1}
        set={props.recordedExercise.potentialSets[additionalPotentialSetIndex]}
        updateRepCount={(reps) =>
          updateRepCountForSet(additionalPotentialSetIndex, reps)
        }
        close={() => setAdditionalPotentialSetIndex(-1)}
      />
      <Portal>
        <Dialog visible={notesDialogOpen}>
          <Dialog.Title>
            <T
              keyName="SessionNotesFor{name}"
              params={{ name: recordedExercise.blueprint.name }}
            />
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              value={editorNotes}
              multiline
              mode="outlined"
              onChangeText={setEditorNotes}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNotesDialogOpen(false)}>
              <T keyName="Cancel" />
            </Button>
            <Button
              onPress={() => {
                updateNotesForExercise(editorNotes);
                setNotesDialogOpen(false);
              }}
            >
              <T keyName="Save" />
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <ConfirmationDialog
        headline={t('RemoveExerciseQuestion')}
        textContent={t('RemoveExerciseMessage')}
        okText={t('Remove')}
        open={removeExerciseDialogOpen}
        onOk={() => {
          setRemoveExerciseDialogOpen(false);
          onRemoveExercise();
        }}
        onCancel={() => setRemoveExerciseDialogOpen(false)}
        preventCancel={false}
      />
      <PreviousExerciseViewer
        name={recordedExercise.blueprint.name}
        previousRecordedExercises={props.previousRecordedExercises}
        close={() => setPreviousDialogOpen(false)}
        open={previousDialogOpen}
      />
    </View>
  );
}
