import { RootState } from '@/store';
import {
  cycleExerciseReps,
  SessionTarget,
  toggleExercisePerSetWeight,
  updateExerciseWeight,
  updateNotesForExercise,
  updateWeightForSet,
} from '@/store/current-session';
import { Redirect } from 'expo-router';
import { Card, Icon } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Text } from 'react-native';
import EmptyInfo from '@/components/presentation/empty-info';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import ItemList from '@/components/presentation/item-list';
import { RecordedExercise, Session } from '@/models/session-models';
import WeightedExercise from '@/components/presentation/weighted-exercise';

export default function SessionComponent(props: {
  target: SessionTarget;
  showBodyweight: boolean;
}) {
  const { spacing } = useAppTheme();
  const { t } = useTranslate();
  const session = useSelector(
    (state: RootState) => state.currentSession[props.target],
  );
  const storeDispatch = useDispatch();
  const dispatch = <T,>(
    reducer: (a: { payload: T; target: SessionTarget }) => any,
    payload: T,
  ) => storeDispatch(reducer({ payload, target: props.target }));
  if (!session) {
    return <Redirect href="/" />;
  }
  const notesComponent = session.blueprint.notes ? (
    <Card
      mode="contained"
      style={{
        marginVertical: spacing[2],
        marginHorizontal: spacing[7],
      }}
    >
      <Card.Content
        style={{
          gap: spacing[4],
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Icon source="text" size={20} />
        <Text>{session.blueprint.notes}</Text>
      </Card.Content>
    </Card>
  ) : null;

  const emptyInfo =
    session.recordedExercises.length === 0 ? (
      <EmptyInfo style={{ marginVertical: spacing[8] }}>
        {t('SessionContainsNoExercises')}
      </EmptyInfo>
    ) : null;

  const renderItem = (item: RecordedExercise, index: number) => (
    <WeightedExercise
      recordedExercise={item}
      toStartNext={Session.nextExercise(session) === item}
      cycleRepCountForSet={(setIndex) =>
        dispatch(cycleExerciseReps, {
          exerciseIndex: index,
          setIndex,
        })
      }
      updateWeightForExercise={(weight) =>
        dispatch(updateExerciseWeight, {
          exerciseIndex: index,
          weight,
        })
      }
      togglePerSepWeight={() =>
        dispatch(toggleExercisePerSetWeight, {
          exerciseIndex: index,
        })
      }
      updateWeightForSet={(setIndex, weight) =>
        dispatch(updateWeightForSet, {
          exerciseIndex: index,
          weight,
          setIndex,
        })
      }
      updateNotesForExercise={(notes) =>
        dispatch(updateNotesForExercise, { notes, exerciseIndex: index })
      }
      onEditExercise={() => {}}
      onRemoveExercise={() => {}}
      onOpenLink={() => {}}
      isReadonly={props.target === 'feedSession'}
      showPreviousButton={props.target === 'workoutSession'}
      // TODO
      previousRecordedExercises={[]}
      showAdditionalActionsForSet={() => {}}
    />
  );

  return (
    <>
      {notesComponent}
      {emptyInfo}
      <ItemList items={session.recordedExercises} renderItem={renderItem} />
    </>
  );
}
