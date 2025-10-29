import ItemTitle from '@/components/presentation/item-title';
import { spacing } from '@/hooks/useAppTheme';
import { RecordedExercise } from '@/models/session-models';
import { ReactNode, useState } from 'react';
import { View } from 'react-native';
import { Menu, Tooltip } from 'react-native-paper';
import { useTranslate } from '@tolgee/react';
import PreviousExerciseViewer from '@/components/presentation/previous-exercise-viewer';
import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import ExerciseNotesDisplay from '@/components/presentation/exercise-notes-display';
import RecordedExerciseNotesEditor from '@/components/presentation/recorded-exercise-notes-editor';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';

interface ExerciseSectionProps {
  recordedExercise: RecordedExercise;
  previousRecordedExercises: RecordedExercise[];
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;

  children: ReactNode;

  updateNotesForExercise: (notes: string) => void;
  onOpenLink: () => void;
  onEditExercise: () => void;
  onRemoveExercise: () => void;
}

export default function ExerciseSection(props: ExerciseSectionProps) {
  const { updateNotesForExercise, onRemoveExercise } = props;
  const { t } = useTranslate();
  const { recordedExercise } = props;
  const [menuVisible, setMenuVisible] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [previousDialogOpen, setPreviousDialogOpen] = useState(false);
  const [removeExerciseDialogOpen, setRemoveExerciseDialogOpen] =
    useState(false);
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
        {props.children}
        <ExerciseNotesDisplay
          exercise={props.recordedExercise}
          previousExercise={props.previousRecordedExercises.at(0)}
        />
      </View>

      <RecordedExerciseNotesEditor
        exerciseName={recordedExercise.blueprint.name}
        onDismiss={() => setNotesDialogOpen(false)}
        open={notesDialogOpen}
        notes={recordedExercise.notes}
        onUpdateNotes={updateNotesForExercise}
      />
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
