import ExerciseSummary from '@/components/presentation/exercise-summary';
import { spacing } from '@/hooks/useAppTheme';
import { Session } from '@/models/session-models';
import { Fragment } from 'react';
import { View } from 'react-native';
import { Divider } from 'react-native-paper';

interface SessionSummaryProps {
  session: Session;
  isFilled: boolean;
}
export default function SessionSummary({
  session,
  isFilled,
}: SessionSummaryProps) {
  return (
    <View style={{ gap: spacing[2], flex: 1 }} data-cy="session-summary">
      {session.recordedExercises.map((ex, index) => (
        <Fragment key={index}>
          <ExerciseSummary exercise={ex} isFilled={isFilled} showName={true} />

          {session.recordedExercises.length - 1 !== index && (
            <Divider style={{}} />
          )}
        </Fragment>
      ))}
    </View>
  );
}
