import { RootState } from '@/store';
import {
  cycleExerciseReps,
  SessionTarget,
  toggleExercisePerSetWeight,
  updateBodyweight,
  updateExerciseWeight,
  updateNotesForExercise,
  updateWeightForSet,
} from '@/store/current-session';
import { Button, Card, FAB, Icon } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { ScrollView, Text, View } from 'react-native';
import EmptyInfo from '@/components/presentation/empty-info';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import ItemList from '@/components/presentation/item-list';
import { RecordedExercise, Session } from '@/models/session-models';
import WeightedExercise from '@/components/presentation/weighted-exercise';
import WeightDisplay from '@/components/presentation/weight-display';
import BigNumber from 'bignumber.js';
import RestTimer from '@/components/presentation/rest-timer';
import FloatingBottomContainer from '@/components/presentation/floating-bottom-container';
import { useState } from 'react';
import { useScroll } from '@/hooks/useScollListener';

export default function SessionComponent(props: {
  target: SessionTarget;
  showBodyweight: boolean;
}) {
  const { setScrolled } = useScroll();
  const [floatingBottomSize, setFloatingBottomSize] = useState(0);
  const { colors, spacing, font } = useAppTheme();
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
    return <Text>Loading</Text>;
  }
  const isReadonly = props.target === 'feedSession';
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
        <Text style={{ color: colors.onSurface }}>
          {session.blueprint.notes}
        </Text>
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
      isReadonly={isReadonly}
      showPreviousButton={props.target === 'workoutSession'}
      // TODO
      previousRecordedExercises={[]}
      showAdditionalActionsForSet={() => {}}
    />
  );

  const bodyWeight = props.showBodyweight ? (
    <Card style={{ marginHorizontal: spacing[2] }} mode="contained">
      <Card.Content
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text
          style={{
            ...font['text-xl'],
            fontWeight: 'bold',
            color: colors.onSurface,
          }}
        >
          {t('Bodyweight')}
        </Text>
        <WeightDisplay
          allowNull={true}
          weight={session.bodyweight}
          updateWeight={(bodyweight) =>
            dispatch(updateBodyweight, { bodyweight })
          }
          increment={new BigNumber('0.1')}
          label={t('Bodyweight')}
        />
      </Card.Content>
    </Card>
  ) : null;

  const sessionInPlan = false; // TODO
  const openUpdatePlanDialog = () => {}; // TODO

  const updatePlanButton = isReadonly ? null : (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing[2],
        marginTop: spacing[6],
      }}
    >
      {!sessionInPlan && session.recordedExercises.length > 0 ? (
        <Button
          mode="contained-tonal"
          icon={'plus'}
          onPress={openUpdatePlanDialog}
        >
          {t('UpdatePlan')}
        </Button>
      ) : null}
    </View>
  );

  const SnackBar = () => {
    const lastExercise = Session.lastExercise(session);
    const lastRecordedSet = RecordedExercise.lastRecordedSet(lastExercise);
    if (
      props.target === 'workoutSession' &&
      Session.nextExercise(session) &&
      lastExercise &&
      lastRecordedSet?.set
    ) {
      const lastSetFailed =
        lastRecordedSet.set.repsCompleted < lastExercise.blueprint.repsPerSet;

      return (
        <RestTimer
          rest={lastExercise.blueprint.restBetweenSets}
          startTime={lastRecordedSet.set.completionTime.atDate(session.date)}
          failed={lastSetFailed}
        />
      );
    }

    return null;
  };

  const fab = isReadonly ? null : (
    <View
      onLayout={(event) =>
        setFloatingBottomSize(event.nativeEvent.layout.height)
      }
      style={{ position: 'absolute', bottom: 0, width: '100%' }}
    >
      <FloatingBottomContainer
        fab={
          <FAB
            variant="surface"
            size="small"
            icon="plus"
            label={t('AddExercise')}
          />
        }
        additionalContent={<SnackBar />}
      />
    </View>
  );

  return (
    <View style={{ position: 'relative' }}>
      <ScrollView
        onScroll={(e) => setScrolled(e.nativeEvent.contentOffset.y > 0)}
        style={{
          height: '100%',
          position: 'relative',
        }}
      >
        {notesComponent}
        {emptyInfo}
        <ItemList items={session.recordedExercises} renderItem={renderItem} />
        {bodyWeight}
        {updatePlanButton}
        <View style={{ height: floatingBottomSize }} />
      </ScrollView>
      {fab}
    </View>
  );
}
