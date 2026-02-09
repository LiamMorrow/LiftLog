import ExerciseSummary from '@/components/presentation/summary/exercise-summary';
import { spacing } from '@/hooks/useAppTheme';
import { Session } from '@/models/session-models';
import { View } from 'react-native';

interface SessionSummaryProps {
  session: Session;
  isFilled?: boolean;
  showWeight?: boolean;
}
export default function SessionSummary({
  session,
  isFilled,
  showWeight,
}: SessionSummaryProps) {
  return (
    <View style={{ gap: spacing[2], flex: 1 }} testID="session-summary">
      {session.recordedExercises
        .filter((x) => x.isStarted || !isFilled)
        .map((ex, index) => (
          <ExerciseSummary
            key={index}
            exercise={ex}
            isFilled={!!isFilled}
            showName={true}
            showWeight={!!showWeight}
            showDate={false}
          />
        ))}
    </View>
  );
}
