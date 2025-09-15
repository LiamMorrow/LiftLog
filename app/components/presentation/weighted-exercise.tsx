import ItemTitle from '@/components/presentation/item-title';
import PotentialSetCounter from '@/components/presentation/potential-set-counter';
import { spacing } from '@/hooks/useAppTheme';
import { RecordedWeightedExercise } from '@/models/session-models';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  Dialog,
  IconButton,
  Menu,
  Portal,
  TextInput,
  Tooltip,
} from 'react-native-paper';
import { T, useTranslate } from '@tolgee/react';

import PotentialSetAdditionalActionsDialog from '@/components/presentation/potential-sets-addition-actions-dialog';
import PreviousExerciseViewer from '@/components/presentation/previous-exercixe-viewer';
import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import ExerciseNotesDisplay from '@/components/presentation/exercise-notes-display';
import { WeightAppliesTo } from '@/store/current-session';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

interface WeightedExerciseProps {
  recordedExercise: RecordedWeightedExercise;
  previousRecordedExercises: RecordedWeightedExercise[];
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;

  cycleRepCountForSet: (setIndex: number) => void;
  updateRepCountForSet: (setIndex: number, reps: number | undefined) => void;
  updateWeightForSet: (
    setIndex: number,
    weight: BigNumber,
    applyTo: WeightAppliesTo,
  ) => void;
  updateWeightForExercise: (weight: BigNumber) => void;
  updateNotesForExercise: (notes: string) => void;
  onOpenLink: () => void;
  onEditExercise: () => void;
  onRemoveExercise: () => void;
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
        <Tooltip title={t('Previously completed')}>
          <IconButton
            testID="prev-exercise-btn"
            icon={'history'}
            onPress={showPrevious}
          />
        </Tooltip>
      ) : null}
      {!props.isReadonly ? (
        <Tooltip title={t('Notes')}>
          <IconButton
            testID="exercise-notes-btn"
            icon={'notes'}
            onPress={() => setNotesDialogOpen(true)}
          />
        </Tooltip>
      ) : null}

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <IconButton
            testID="more-exercise-btn"
            onPress={() => setMenuVisible(true)}
            icon={'moreHoriz'}
          />
        }
      >
        <Menu.Item
          onPress={() => {
            props.onEditExercise();
            setMenuVisible(false);
          }}
          testID="exercise-edit-menu-button"
          leadingIcon={'edit'}
          title={t('Edit')}
        />
        <Menu.Item
          testID="exercise-notes-more-btn"
          title={t('Notes')}
          leadingIcon={'notes'}
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
          leadingIcon={'delete'}
          title={t('Remove')}
        />
        {!!props.recordedExercise.blueprint.link && (
          <Menu.Item
            onPress={() => {
              props.onOpenLink();
              setMenuVisible(false);
            }}
            leadingIcon={'openInBrowser'}
            title={t('OpenLink')}
          />
        )}
      </Menu>
    </View>
  );

  return (
    <View
      style={{
        flexDirection: 'column',
        gap: spacing[4],
        paddingBlock: spacing[4],
        paddingHorizontal: spacing.pageHorizontalMargin,
        width: '100%',
      }}
      testID="weighted-exercise"
    >
      <View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <ItemTitle
            testID="weighted-exercise-title"
            style={{ marginVertical: spacing[2] }}
            title={recordedExercise.blueprint.name}
          />
          {interactiveButtons}
        </View>
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
              onUpdateWeight={(w, applyTo) =>
                props.updateWeightForSet(index, w, applyTo)
              }
              set={set}
              showWeight={true}
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
        <ExerciseNotesDisplay
          exercise={props.recordedExercise}
          previousExercise={props.previousRecordedExercises.at(0)}
        />
      </View>

      <PotentialSetAdditionalActionsDialog
        open={additionalPotentialSetIndex !== -1}
        repTarget={props.recordedExercise.blueprint.repsPerSet}
        set={props.recordedExercise.potentialSets[additionalPotentialSetIndex]}
        updateRepCount={(reps) =>
          updateRepCountForSet(additionalPotentialSetIndex, reps)
        }
        close={() => setAdditionalPotentialSetIndex(-1)}
      />
      <Portal>
        <KeyboardAvoidingView
          behavior={'height'}
          style={{
            flex: 1,
            pointerEvents: notesDialogOpen ? 'box-none' : 'none',
          }}
        >
          <Dialog
            visible={notesDialogOpen}
            onDismiss={() => setNotesDialogOpen(false)}
          >
            <Dialog.Title>
              <T
                keyName="SessionNotesFor{name}"
                params={{ name: recordedExercise.blueprint.name }}
              />
            </Dialog.Title>
            <Dialog.Content>
              <TextInput
                defaultValue={editorNotes}
                multiline
                mode="outlined"
                numberOfLines={6}
                onChangeText={setEditorNotes}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                testID="cancel-notes"
                onPress={() => setNotesDialogOpen(false)}
              >
                <T keyName="Cancel" />
              </Button>
              <Button
                testID="save-notes"
                onPress={() => {
                  updateNotesForExercise(editorNotes);
                  setNotesDialogOpen(false);
                }}
              >
                <T keyName="Save" />
              </Button>
            </Dialog.Actions>
          </Dialog>
        </KeyboardAvoidingView>
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
