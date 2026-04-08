import ItemTitle from '@/components/presentation/foundation/item-title';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { RecordedExercise } from '@/models/session-models';
import { ReactNode, useState } from 'react';
import { View } from 'react-native';
import { Card, Menu, Tooltip } from 'react-native-paper';
import { useTranslate } from '@tolgee/react';
import PreviousExerciseViewer from '@/components/presentation/workout/weighted/previous-exercise-viewer';
import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import ExerciseNotesDisplay from '@/components/presentation/workout/exercise-notes-display';
import RecordedExerciseNotesEditor from '@/components/presentation/workout/recorded-exercise-notes-editor';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
import TouchableRipple from '@/components/presentation/foundation/gesture-wrappers/touchable-ripple';

interface ExerciseSectionProps {
  recordedExercise: RecordedExercise;
  previousRecordedExercises: RecordedExercise[];
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;
  compact?: boolean;
  compactSummary?: ReactNode;
  onToggleCompact?: () => void;

  children: ReactNode;

  updateNotesForExercise: (notes: string) => void;
  onOpenLink: () => void;
  onEditExercise: () => void;
  onRemoveExercise: () => void;
}

export default function ExerciseSection(props: ExerciseSectionProps) {
  const { colors } = useAppTheme();
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
  const isCompact = !!props.compact;

  const interactiveButtons = props.isReadonly || isCompact ? (
    <View style={{ height: 40 }}></View>
  ) : (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    >
      {props.showPreviousButton ? (
        <Tooltip title={t('workout.previously_completed.label')}>
          <IconButton
            testID="prev-exercise-btn"
            icon={'history'}
            onPress={showPrevious}
          />
        </Tooltip>
      ) : null}
      {!props.isReadonly ? (
        <Tooltip title={t('generic.notes.label')}>
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
          title={t('generic.edit.button')}
        />
        <Menu.Item
          testID="exercise-notes-more-btn"
          title={t('generic.notes.label')}
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
          title={t('generic.remove.button')}
        />
        {!!props.recordedExercise.blueprint.link && (
          <Menu.Item
            onPress={() => {
              props.onOpenLink();
              setMenuVisible(false);
            }}
            leadingIcon={'openInBrowser'}
            title={t('generic.open_link.button')}
          />
        )}
      </Menu>
    </View>
  );
  return (
    <Card
      mode="contained"
      style={{
        backgroundColor: colors.surfaceContainer,
        borderColor: colors.outlineVariant,
        borderWidth: 1,
        marginHorizontal: spacing.pageHorizontalMargin,
        marginVertical: spacing[2],
      }}
      testID="weighted-exercise"
    >
      <Card.Content
        style={{
          flexDirection: 'column',
          gap: spacing[3],
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[3],
        }}
      >
        <View>
          {isCompact ? (
            <TouchableRipple onPress={props.onToggleCompact} borderless>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  gap: spacing[2],
                  paddingVertical: spacing[1],
                }}
              >
                <ItemTitle
                  testID="weighted-exercise-title"
                  style={{ marginVertical: spacing[1], flex: 1 }}
                  title={recordedExercise.blueprint.name}
                />
                <View style={{ flexShrink: 1 }}>{props.compactSummary}</View>
              </View>
            </TouchableRipple>
          ) : (
            <>
              {props.onToggleCompact ? (
                <TouchableRipple
                  onPress={props.onToggleCompact}
                  borderless
                  style={{ borderRadius: spacing[2] }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <ItemTitle
                      testID="weighted-exercise-title"
                      style={{ marginVertical: spacing[1], flex: 1 }}
                      title={recordedExercise.blueprint.name}
                    />
                    {interactiveButtons}
                  </View>
                </TouchableRipple>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <ItemTitle
                    testID="weighted-exercise-title"
                    style={{ marginVertical: spacing[1] }}
                    title={recordedExercise.blueprint.name}
                  />
                  {interactiveButtons}
                </View>
              )}
              {props.children}
              <ExerciseNotesDisplay
                exercise={props.recordedExercise}
                previousExercise={props.previousRecordedExercises.at(0)}
              />
            </>
          )}
        </View>

        <RecordedExerciseNotesEditor
          exerciseName={recordedExercise.blueprint.name}
          onDismiss={() => setNotesDialogOpen(false)}
          open={notesDialogOpen}
          notes={recordedExercise.notes}
          onUpdateNotes={updateNotesForExercise}
        />
        <ConfirmationDialog
          headline={t('exercise.remove.confirm.title')}
          textContent={t('exercise.remove.confirm.body')}
          okText={t('generic.remove.button')}
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
      </Card.Content>
    </Card>
  );
}
