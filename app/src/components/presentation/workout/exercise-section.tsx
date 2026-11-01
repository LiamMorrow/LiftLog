import ItemTitle from '@/components/presentation/foundation/item-title';
import { spacing } from '@/hooks/useAppTheme';
import { RecordedExercise, RecordedWeightedExercise } from '@/models/session-models';
import { ReactNode, useState } from 'react';
import { View } from 'react-native';
import { openUrl } from '@/utils/open-url';
import Menu, { MenuItem } from '@/components/presentation/foundation/menu';
import { useTranslate } from '@tolgee/react';
import { useConfirm } from '@/hooks/useConfirm';
import ExerciseNotesDisplay from '@/components/presentation/workout/exercise-notes-display';
import RecordedExerciseNotesEditor from '@/components/presentation/workout/recorded-exercise-notes-editor';
import { NativeIconButton } from '@/components/presentation/foundation/native-icon-button';
import MoreHorizIcon from '@expo/material-symbols/more_horiz.xml';
import { useRouter } from 'expo-router';
import { getExerciseHistoryHref } from '@/components/smart/exercise-history';
import { Updater } from '@/utils/types';
import Analytics from '@expo/material-symbols/analytics.xml';
import Edit from '@expo/material-symbols/edit.xml';
import Notes from '@expo/material-symbols/notes.xml';
import History from '@expo/material-symbols/history.xml';
import Delete from '@expo/material-symbols/delete.xml';
import ArrowUpward from '@expo/material-symbols/arrow_upward.xml';
import ArrowDownward from '@expo/material-symbols/arrow_downward.xml';
import OpenInBrowser from '@expo/material-symbols/open_in_browser.xml';

interface ExerciseSectionProps<T extends RecordedExercise> {
  recordedExercise: T;
  previousLineageExercise: RecordedExercise | undefined;
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;
  titleLeading?: ReactNode;

  children: ReactNode;

  updateExercise: (update: Updater<T>) => void;
  onEditExercise: (() => void) | undefined;
  onRemoveExercise: () => void;
  onMoveExerciseUp: (() => void) | undefined;
  onMoveExerciseDown: (() => void) | undefined;
}

export default function ExerciseSection<T extends RecordedExercise>(props: ExerciseSectionProps<T>) {
  const { updateExercise, onRemoveExercise } = props;
  const { t } = useTranslate();
  const { push } = useRouter();
  const { recordedExercise } = props;
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const confirm = useConfirm();
  const showStats = recordedExercise instanceof RecordedWeightedExercise;
  const showPrevious = () => {
    push(getExerciseHistoryHref(recordedExercise.blueprint), { withAnchor: true });
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
        <NativeIconButton
          testID="prev-exercise-btn"
          icon={History}
          systemImage="clock.arrow.circlepath"
          label={t('workout.previously_completed.label')}
          onPress={showPrevious}
        />
      ) : null}
      {!props.isReadonly ? (
        <NativeIconButton
          testID="exercise-notes-btn"
          icon={Notes}
          systemImage="text.alignleft"
          label={t('generic.notes.label')}
          onPress={() => setNotesDialogOpen(true)}
        />
      ) : null}

      <Menu
        trigger={{
          testID: 'more-exercise-btn',
          icon: MoreHorizIcon,
          systemImage: 'ellipsis',
          label: t('generic.more_options.button'),
        }}
        items={[
          // Absent for a session the user does not own, which has nothing to edit.
          ...(props.onEditExercise
            ? [
                {
                  label: t('generic.edit.button'),
                  icon: Edit,
                  systemImage: 'pencil',
                  onPress: props.onEditExercise,
                } satisfies MenuItem,
              ]
            : []),
          ...(props.onMoveExerciseUp
            ? [
                {
                  label: t('exercise.move_up.button'),
                  icon: ArrowUpward,
                  systemImage: 'arrow.up',
                  onPress: props.onMoveExerciseUp,
                } satisfies MenuItem,
              ]
            : []),
          ...(props.onMoveExerciseDown
            ? [
                {
                  label: t('exercise.move_down.button'),
                  icon: ArrowDownward,
                  systemImage: 'arrow.down',
                  onPress: props.onMoveExerciseDown,
                } satisfies MenuItem,
              ]
            : []),
          {
            label: t('generic.notes.label'),
            icon: Notes,
            systemImage: 'note.text',
            onPress: () => setNotesDialogOpen(true),
          },
          ...(showStats
            ? [
                {
                  label: t('stats.stats.title'),
                  icon: Analytics,
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
            icon: Delete,
            systemImage: 'trash',
            onPress: () =>
              confirm({
                title: t('exercise.remove.confirm.title'),
                message: t('exercise.remove.confirm.body'),
                okText: t('generic.remove.button'),
                destructive: true,
                onOk: onRemoveExercise,
              }),
          },
          ...(props.recordedExercise.blueprint.link
            ? [
                {
                  label: t('generic.open_link.button'),
                  icon: OpenInBrowser,
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], flexShrink: 1 }}>
            {props.titleLeading}
            <ItemTitle
              testID="weighted-exercise-title"
              style={{ marginVertical: spacing[2] }}
              title={recordedExercise.blueprint.name}
            />
          </View>
          {interactiveButtons}
        </View>
        {props.children}
        <ExerciseNotesDisplay exercise={props.recordedExercise} previousExercise={props.previousLineageExercise} />
      </View>

      <RecordedExerciseNotesEditor
        exerciseName={recordedExercise.blueprint.name}
        onDismiss={() => setNotesDialogOpen(false)}
        open={notesDialogOpen}
        notes={recordedExercise.notes}
        onUpdateNotes={(notes) => updateExercise((ex) => ex.with({ notes }) as T)}
      />
    </View>
  );
}
