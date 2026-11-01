import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import Button from '@/components/presentation/foundation/button';
import { Popover } from '@/components/presentation/foundation/popover';
import { SegmentedList } from '@/components/presentation/foundation/segmented-list';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { getExerciseHistoryHref } from '@/components/smart/exercise-history';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Weight } from '@/models/weight';
import { useAppSelector } from '@/store';
import { selectFeedPersonalRecords } from '@/store/activity';
import { PersonalRecord, PersonalRecordKind } from '@/store/stats/personal-records';
import { useOwnHistory } from '@/components/smart/own-history-provider';
import { TranslationKey, useTranslate } from '@tolgee/react';
import { View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';

export type RecordScope = 'history' | 'feed';

export interface ScopedRecords {
  records: PersonalRecord[] | undefined;
  scope: RecordScope;
}

const icons: Record<PersonalRecordKind, AppIconSource> = {
  heaviest: 'fitnessCenter',
  oneRepMax: 'function',
  mostReps: 'stacks',
  bestSet: 'bolt',
};

const labelKeys = {
  history: {
    heaviest: 'history.pr_badge.heaviest.label',
    oneRepMax: 'history.pr_badge.one_rep_max.label',
    mostReps: 'history.pr_badge.most_reps.label',
    mostRepsAt: 'history.pr_badge.most_reps_at.label',
    bestSet: 'history.pr_badge.best_set.label',
    bestSetAt: 'history.pr_badge.best_set_at.label',
  } satisfies Record<string, TranslationKey>,
  feed: {
    heaviest: 'feed.pr_badge.heaviest.label',
    oneRepMax: 'feed.pr_badge.one_rep_max.label',
    mostReps: 'feed.pr_badge.most_reps.label',
    mostRepsAt: 'feed.pr_badge.most_reps_at.label',
    bestSet: 'feed.pr_badge.best_set.label',
    bestSetAt: 'feed.pr_badge.best_set_at.label',
  } satisfies Record<string, TranslationKey>,
} as const;

export function useHistoryRecords(sessionId: string): ScopedRecords {
  return { records: useOwnHistory().personalRecords.get(sessionId), scope: 'history' };
}

/** Your own events read your all-time history; a friend's only have the feed's window. */
export function useEventRecords(eventId: string, isOwnEvent: boolean): ScopedRecords {
  const own = useHistoryRecords(eventId);
  const feed = useAppSelector(selectFeedPersonalRecords).get(eventId);
  return isOwnEvent ? own : { records: feed, scope: 'feed' };
}

function useRecordFormat(scope: RecordScope) {
  const { t } = useTranslate();
  const unit = useAppSelector((x) => x.settings.useImperialUnits) ? 'pounds' : 'kilograms';
  const weight = (value: Weight) => {
    const converted = value.convertTo(unit);
    return new Weight(converted.value.decimalPlaces(2), unit).shortLocaleFormat();
  };
  const keys = labelKeys[scope];

  const label = (record: PersonalRecord) => {
    if (record.kind === 'heaviest' || record.kind === 'oneRepMax' || record.weight.value.isZero()) {
      return t(keys[record.kind]);
    }
    const at =
      record.resistance === 'bodyweight'
        ? `${t('exercise.short_bodyweight.label')} ${record.weight.value.isPositive() ? '+' : ''}${weight(record.weight)}`
        : weight(record.weight);
    return t(record.kind === 'mostReps' ? keys.mostRepsAt : keys.bestSetAt, { weight: at });
  };
  const amount = (record: PersonalRecord) =>
    record.kind === 'heaviest' || record.kind === 'oneRepMax' ? weight(record.value) : `${record.value}`;
  const gain = (record: PersonalRecord) =>
    record.kind === 'heaviest' || record.kind === 'oneRepMax'
      ? `+${weight(record.value.minus(record.previous))}`
      : `+${record.value - record.previous}`;

  return { label, amount, gain };
}

function byExercise(records: PersonalRecord[]): PersonalRecord[][] {
  return [...new Set(records.map((x) => x.exerciseOrd))].map((exerciseOrd) =>
    records.filter((x) => x.exerciseOrd === exerciseOrd),
  );
}

/** One exercise's records, a row each: what it set, the amount, and how much it beat the last best by. */
function RecordRows({ records, scope }: { records: PersonalRecord[]; scope: RecordScope }) {
  const { colors } = useAppTheme();
  const { label, amount, gain } = useRecordFormat(scope);
  return records.map((record) => (
    <View key={record.kind} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
      <Icon source={icons[record.kind]} size={16} color={colors.amber} />
      <SurfaceText font="text-sm" style={{ flex: 1 }}>
        {label(record)}
      </SurfaceText>
      <SurfaceText font="text-sm" weight="bold">
        {amount(record)}
      </SurfaceText>
      <SurfaceText font="text-sm" weight="500" color="amber">
        {gain(record)}
      </SurfaceText>
    </View>
  ));
}

function RecordPopoverContent({
  records,
  scope,
  close,
}: {
  records: PersonalRecord[];
  scope: RecordScope;
  close: () => void;
}) {
  const { push } = useRouter();
  const { t } = useTranslate();
  const { exerciseName } = records[0]!;
  return (
    <View style={{ gap: spacing[2] }}>
      <SurfaceText font="text-sm" weight="bold">
        {exerciseName}
      </SurfaceText>
      <RecordRows records={records} scope={scope} />
      {scope === 'history' && (
        <Button
          mode="text"
          style={{ alignSelf: 'flex-end', marginBottom: -spacing[2], marginRight: -spacing[2] }}
          onPress={() => {
            close();
            push(getExerciseHistoryHref({ name: exerciseName, type: 'WeightedExerciseBlueprint' }));
          }}
        >
          {t('history.pr_badge.see_history.button')}
        </Button>
      )}
    </View>
  );
}

/** A chip per exercise that set a record, under a session summary. Tap one for what it set. */
export function PrStrip({ records, scope }: ScopedRecords) {
  const { colors } = useAppTheme();
  const { label } = useRecordFormat(scope);
  const showAccomplishments = useAppSelector((x) => x.settings.showAccomplishments);

  if (!showAccomplishments || !records?.length) {
    return null;
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[2],
      }}
    >
      {byExercise(records).map((exerciseRecords) => {
        const { exerciseOrd, exerciseName } = exerciseRecords[0]!;
        return (
          <Popover
            key={exerciseOrd}
            accessibilityLabel={exerciseName}
            trigger={(open) => (
              <View style={{ borderRadius: 8, overflow: 'hidden', backgroundColor: colors.surface }}>
                <TouchableRipple
                  onPress={open}
                  accessibilityRole="button"
                  accessibilityLabel={`${exerciseName}: ${exerciseRecords.map(label).join(', ')}`}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing[1],
                      height: 32,
                      paddingLeft: spacing[2],
                      paddingRight: spacing[3],
                    }}
                  >
                    <Icon source="trophy" size={16} color={colors.amber} />
                    <SurfaceText
                      font="text-sm"
                      weight="500"
                      numberOfLines={1}
                      style={{ flexShrink: 1, marginLeft: spacing[0.5] }}
                    >
                      {exerciseName}
                    </SurfaceText>
                  </View>
                </TouchableRipple>
              </View>
            )}
          >
            {(close) => <RecordPopoverContent records={exerciseRecords} scope={scope} close={close} />}
          </Popover>
        );
      })}
    </View>
  );
}

/** Every record a session set, under each exercise's name. */
export function PrRecordList({ records, scope }: ScopedRecords) {
  const showAccomplishments = useAppSelector((x) => x.settings.showAccomplishments);

  if (!showAccomplishments || !records?.length) {
    return null;
  }

  return (
    <View style={{ gap: spacing[2] }}>
      {byExercise(records).map((exerciseRecords) => (
        <ExerciseRecords key={exerciseRecords[0]!.exerciseOrd} records={exerciseRecords} scope={scope} />
      ))}
    </View>
  );
}

export function PrRecordSegmentedList({ records, scope }: ScopedRecords) {
  const showAccomplishments = useAppSelector((x) => x.settings.showAccomplishments);

  if (!showAccomplishments || !records?.length) {
    return null;
  }

  return (
    <SegmentedList
      items={byExercise(records)}
      itemKey={(exerciseRecords) => `${exerciseRecords[0]!.exerciseOrd}`}
      renderItem={(exerciseRecords) => (
        <View style={{ padding: spacing[4] }}>
          <ExerciseRecords records={exerciseRecords} scope={scope} />
        </View>
      )}
    />
  );
}

function ExerciseRecords({ records, scope }: { records: PersonalRecord[]; scope: RecordScope }) {
  return (
    <View style={{ gap: spacing[1] }}>
      <SurfaceText font="text-sm" weight="bold">
        {records[0]!.exerciseName}
      </SurfaceText>
      <RecordRows records={records} scope={scope} />
    </View>
  );
}
