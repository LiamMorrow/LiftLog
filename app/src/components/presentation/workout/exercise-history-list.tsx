import EmptyInfo from '@/components/presentation/foundation/empty-info';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { PotentialSetDisplay } from '@/components/presentation/workout/weighted/potential-set-display';
import { CardioValueTile } from '@/components/presentation/workout/cardio/cardio-value-tile';
import { rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { RecordedCardioExercise, RecordedCardioExerciseSet, RecordedExercise } from '@/models/session-models';
import { RecordedWeightedExercise } from '@/models/session-models';
import { formatCardioTarget } from '@/utils/format-cardio-target';
import { formatDistance } from '@/utils/distance';
import { formatDuration } from '@/utils/format-duration';
import { localeFormatBigNumber } from '@/utils/locale-bignumber';
import { T, useTranslate } from '@tolgee/react';
import { LegendList } from '@legendapp/list';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Divider } from 'react-native-paper';
import { match, P } from 'ts-pattern';

export function ExerciseHistoryList(props: {
  exercises: RecordedExercise[];
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <LegendList
      testID="exercise-history-list"
      data={props.exercises}
      keyExtractor={(exercise, index) => exercise.latestTime?.toString() ?? index.toString()}
      contentContainerStyle={props.contentContainerStyle}
      renderItem={({ item }) => <ExerciseHistoryEntry exercise={item} />}
      ItemSeparatorComponent={() => <Divider style={{ marginVertical: spacing[4] }} />}
      ListEmptyComponent={
        <View style={{ height: 100 }}>
          <EmptyInfo>
            <T keyName="exercise.never_done_before.message" />
          </EmptyInfo>
        </View>
      }
    />
  );
}

function ExerciseHistoryEntry(props: { exercise: RecordedExercise }) {
  const { exercise } = props;
  const formatDate = useFormatDate();
  const date = exercise.latestTime?.toLocalDate();

  return (
    <View style={{ gap: spacing[2] }}>
      <SurfaceText font="text-base" weight="bold">
        {date && formatDate(date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
      </SurfaceText>

      {match(exercise)
        .with(P.instanceOf(RecordedWeightedExercise), (exercise) => <WeightedSets exercise={exercise} />)
        .with(P.instanceOf(RecordedCardioExercise), (exercise) => <CardioSets exercise={exercise} />)
        .exhaustive()}

      {exercise.notes ? <HistoryNotes notes={exercise.notes} /> : undefined}
    </View>
  );
}

function WeightedSets(props: { exercise: RecordedWeightedExercise }) {
  const { exercise } = props;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[1] }}>
      {exercise.potentialSets.map((set, index) => (
        <PotentialSetDisplay
          key={index}
          size="compact"
          set={set}
          repsTarget={exercise.repsTargetForSet(index)}
          usesBodyweight={exercise.blueprint.loadBasis === 'bodyweight'}
        />
      ))}
    </View>
  );
}

function CardioSets(props: { exercise: RecordedCardioExercise }) {
  const { t } = useTranslate();
  return (
    <View style={{ gap: spacing[3] }}>
      {props.exercise.sets.map((set, index) => (
        <View key={index} style={{ gap: spacing[1] }}>
          <SurfaceText font="text-xs" color="onSurfaceVariant">
            {t('exercise.set_number.label', { number: index + 1 })} · {formatCardioTarget(set.blueprint.target)}
          </SurfaceText>
          <CardioSetTiles set={set} />
        </View>
      ))}
    </View>
  );
}

/** Only the values this set's blueprint tracks -- an untracked field was never a number the user chose. */
function CardioSetTiles(props: { set: RecordedCardioExerciseSet }) {
  const { set } = props;
  const { t } = useTranslate();
  const { blueprint } = set;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[1] }}>
      {set.tracksDuration && (
        <CardioValueTile isReadonly value={set.duration} format={formatDuration} label={t('generic.time.label')} />
      )}
      {set.tracksDistance && (
        <CardioValueTile isReadonly value={set.distance} format={formatDistance} label={t('exercise.distance.label')} />
      )}
      {blueprint.trackIncline && (
        <CardioValueTile
          isReadonly
          value={set.incline}
          format={localeFormatBigNumber}
          label={t('exercise.incline.label')}
        />
      )}
      {blueprint.trackResistance && (
        <CardioValueTile
          isReadonly
          value={set.resistance}
          format={localeFormatBigNumber}
          label={t('exercise.resistance.label')}
        />
      )}
      {blueprint.trackWeight && (
        <CardioValueTile
          isReadonly
          value={set.weight}
          format={(weight) => weight.shortLocaleFormat()}
          label={t('weight.weight.label')}
        />
      )}
      {blueprint.trackSteps && (
        <CardioValueTile
          isReadonly
          value={set.steps}
          format={(steps) => steps.toString()}
          label={t('exercise.steps.label')}
        />
      )}
    </View>
  );
}

function HistoryNotes(props: { notes: string }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        backgroundColor: colors.secondaryContainer,
        borderRadius: rounding.roundedRectangleRadius,
        padding: spacing[3],
      }}
    >
      <SurfaceText font="text-xs" color="onSecondaryContainer">
        {props.notes}
      </SurfaceText>
    </View>
  );
}
