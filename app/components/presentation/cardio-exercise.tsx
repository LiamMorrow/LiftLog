import { RecordedCardioExercise } from '@/models/session-models';
import ExerciseSection from '@/components/presentation/exercise-section';
import {
  CardioTarget,
  DistanceCardioTarget,
  DistanceUnit,
  TimeCardioTarget,
} from '@/models/blueprint-models';
import { useTranslate } from '@tolgee/react';
import { localeFormatBigNumber } from '@/utils/locale-bignumber';
import { match } from 'ts-pattern';
import { formatDuration } from '@/utils/format-date';
import LimitedHtml from '@/components/presentation/limited-html';
import { IconButton } from 'react-native-paper';

interface CardioExerciseProps {
  recordedExercise: RecordedCardioExercise;
  previousRecordedExercises: RecordedCardioExercise[];
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;

  updateNotesForExercise: (notes: string) => void;
  onOpenLink: () => void;
  onEditExercise: () => void;
  onRemoveExercise: () => void;
}

export default function CardioExercise(props: CardioExerciseProps) {
  const showTimer =
    props.recordedExercise.blueprint.trackTime ||
    props.recordedExercise.blueprint.target.type === 'time';
  const timer = showTimer && (
    <CardioTimer recordedExercise={props.recordedExercise} />
  );
  return (
    <ExerciseSection
      recordedExercise={props.recordedExercise}
      previousRecordedExercises={props.previousRecordedExercises}
      toStartNext={props.toStartNext}
      isReadonly={props.isReadonly}
      showPreviousButton={props.showPreviousButton}
      updateNotesForExercise={props.updateNotesForExercise}
      onOpenLink={props.onOpenLink}
      onEditExercise={props.onEditExercise}
      onRemoveExercise={props.onRemoveExercise}
    >
      <CardioTargetHandler target={props.recordedExercise.blueprint.target} />
      {timer}
    </ExerciseSection>
  );
}

function CardioTimer(props: { recordedExercise: RecordedCardioExercise }) {
  return <IconButton icon={'playCircle'} />;
}

function CardioTargetHandler(props: { target: CardioTarget }) {
  if (props.target.type === 'distance') {
    return <DistanceCardioTargetHandler target={props.target} />;
  }
  return <TimeCardioTargetHandler target={props.target} />;
}

function DistanceCardioTargetHandler(props: { target: DistanceCardioTarget }) {
  const { t } = useTranslate();
  return (
    <LimitedHtml
      value={t('Target distance {distance}', {
        distance:
          localeFormatBigNumber(props.target.value) +
          getShortUnit(props.target.unit),
      })}
    />
  );
}

function TimeCardioTargetHandler(props: { target: TimeCardioTarget }) {
  const { t } = useTranslate();
  return (
    <LimitedHtml
      value={t('Target time {time}', {
        time: formatDuration(props.target.value),
      })}
    />
  );
}

function getShortUnit(unit: DistanceUnit): string {
  return match(unit)
    .with('metre', () => 'm')
    .with('kilometre', () => 'km')
    .with('mile', () => 'mi')
    .with('yard', () => 'yd')
    .exhaustive();
}
