import {
  addExercise,
  selectCurrentSession,
  SessionTarget,
} from '@/store/current-session';
import { useDispatch } from 'react-redux';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import {
  EmptyExerciseBlueprint,
  ExerciseBlueprint,
} from '@/models/session-models';
import FullScreenDialog from '@/components/presentation/full-screen-dialog';
import { ExerciseEditor } from '@/components/presentation/exercise-editor';
import { useAppSelectorWithArg } from '@/store';
import { UnknownAction } from '@reduxjs/toolkit';
import { Appbar, Menu } from 'react-native-paper';

export default function SessionMoreMenuComponent(props: {
  target: SessionTarget;
}) {
  const { t } = useTranslate();
  const session = useAppSelectorWithArg(selectCurrentSession, props.target);
  const storeDispatch = useDispatch();
  const dispatch = <T,>(
    reducer: (a: { payload: T; target: SessionTarget }) => UnknownAction,
    payload: T,
  ) => storeDispatch(reducer({ payload, target: props.target }));
  const [menuOpen, setMenuOpen] = useState(false);

  const isReadonly = props.target === 'feedSession';
  const [editingExerciseBlueprint, setEditingExerciseBlueprint] = useState<
    ExerciseBlueprint | undefined
  >(undefined);
  const [exerciseEditorOpen, setExerciseEditorOpen] = useState(false);

  const handleAddExercise = () => {
    if (editingExerciseBlueprint !== undefined) {
      dispatch(addExercise, {
        blueprint: editingExerciseBlueprint,
      });
      setExerciseEditorOpen(false);
    }
  };

  if (!session || isReadonly) {
    return <></>;
  }

  return (
    <>
      <Menu
        anchorPosition="bottom"
        onDismiss={() => setMenuOpen(false)}
        anchor={
          <Appbar.Action
            testID="session-more"
            icon="moreVert"
            onPress={() => setMenuOpen(true)}
          />
        }
        visible={menuOpen}
      >
        <Menu.Item
          onPress={() => {
            setEditingExerciseBlueprint(EmptyExerciseBlueprint);
            setExerciseEditorOpen(true);
            setMenuOpen(false);
          }}
          testID="session-add-exercise"
          leadingIcon={'add'}
          title={t('AddExercise')}
        />
      </Menu>
      <FullScreenDialog
        title={t('AddExercise')}
        action={t('Add')}
        open={exerciseEditorOpen}
        onAction={handleAddExercise}
        onClose={() => setExerciseEditorOpen(false)}
      >
        {editingExerciseBlueprint ? (
          <ExerciseEditor
            exercise={editingExerciseBlueprint}
            updateExercise={(ex) => {
              setEditingExerciseBlueprint(ex);
            }}
          />
        ) : null}
      </FullScreenDialog>
    </>
  );
}
