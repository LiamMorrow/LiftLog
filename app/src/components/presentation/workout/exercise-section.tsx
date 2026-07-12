import ItemTitle from '@/components/presentation/foundation/item-title';
import { spacing } from '@/hooks/useAppTheme';
import { RecordedExercise, RecordedWeightedExercise } from '@/models/session-models';
import { ReactNode, useState } from 'react';
import { Linking, View } from 'react-native';
import { Tooltip } from 'react-native-paper';
import Menu from '@/components/presentation/foundation/menu';
import { MenuItem } from '@/components/presentation/foundation/menu-props';
import { useTranslate } from '@tolgee/react';
import PreviousExerciseViewer from '@/components/presentation/workout/weighted/previous-exercise-viewer';
import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import ExerciseNotesDisplay from '@/components/presentation/workout/exercise-notes-display';
import RecordedExerciseNotesEditor from '@/components/presentation/workout/recorded-exercise-notes-editor';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
import { useRouter } from 'expo-router';
import { Updater } from '@/utils/types';

interface ExerciseSectionProps<T extends RecordedExercise> {
  recordedExercise: T;
  previousRecordedExercises: RecordedExercise[];
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;

  children: ReactNode;

  updateExercise: (update: Updater<T>) => void;
  onEditExercise: () => void;
  onRemoveExercise: () => void;
}

export default function ExerciseSection<T extends RecordedExercise>(props: ExerciseSectionProps<T>) {
  const { updateExercise, onRemoveExercise } = props;
  const openUrl = (url: string) => {
    void Linking.canOpenURL(url).then(() => Linking.openURL(url));
  };
  const { t } = useTranslate();
  const { push } = useRouter();
  const { recordedExercise } = props;
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [previousDialogOpen, setPreviousDialogOpen] = useState(false);
  const [removeExerciseDialogOpen, setRemoveExerciseDialogOpen] = useState(false);
  const showStats = recordedExercise instanceof RecordedWeightedExercise;
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
        <Tooltip title={t('workout.previously_completed.label')}>
          <IconButton testID="prev-exercise-btn" icon={'history'} onPress={showPrevious} />
        </Tooltip>
      ) : null}
      {!props.isReadonly ? (
        <Tooltip title={t('generic.notes.label')}>
          <IconButton testID="exercise-notes-btn" icon={'notes'} onPress={() => setNotesDialogOpen(true)} />
        </Tooltip>
      ) : null}

      <Menu
        trigger={(open) => <IconButton testID="more-exercise-btn" onPress={open} icon={'moreHoriz'} />}
        items={[
          {
            label: t('generic.edit.button'),
            icon: 'edit',
            systemImage: 'pencil',
            onPress: () => props.onEditExercise(),
          },
          {
            label: t('generic.notes.label'),
            icon: 'notes',
            systemImage: 'note.text',
            onPress: () => setNotesDialogOpen(true),
          },
          ...(showStats
            ? [
                {
                  label: t('stats.stats.title'),
                  icon: 'analytics',
                  systemImage: 'chart.bar',
                  onPress: () =>
                    push(
                      `/stats/expanded-weighted-exercise?exerciseName=${encodeURIComponent(recordedExercise.blueprint.name)}`,
                      { withAnchor: true },
                    ),
                } satisfies MenuItem,
              ]
            : []),
          {
            label: t('generic.remove.button'),
            icon: 'delete',
            systemImage: 'trash',
            onPress: () => setRemoveExerciseDialogOpen(true),
          },
          ...(props.recordedExercise.blueprint.link
            ? [
                {
                  label: t('generic.open_link.button'),
                  icon: 'openInBrowser',
                  systemImage: 'safari',
                  onPress: () => openUrl(props.recordedExercise.blueprint.link),
                } satisfies MenuItem,
              ]
            : []),
        ]}
      />
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
        onUpdateNotes={(notes) => updateExercise((ex) => ex.with({ notes }) as T)}
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
    </View>
  );
}
