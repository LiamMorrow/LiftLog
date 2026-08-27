import { ExerciseSummaryLine } from '@/components/presentation/summary/exercise-summary-line';
import { ColorChoice, spacing } from '@/hooks/useAppTheme';
import { Session } from '@/models/session-models';
import { View } from 'react-native';

interface SessionSummaryProps {
  session: Session;
  isFilled?: boolean;
  showWeight?: boolean;
  color?: ColorChoice;
}
export default function SessionSummary({ session, isFilled, showWeight, color = 'onSurface' }: SessionSummaryProps) {
  return (
    <View style={{ gap: spacing[1] }} testID="session-summary">
      {session.recordedExercises
        .filter((x) => x.isStarted || !isFilled)
        .map((ex, index) => (
          <ExerciseSummaryLine
            key={index}
            exercise={ex}
            isFilled={!!isFilled}
            showWeight={!!showWeight}
            color={color}
          />
        ))}
    </View>
  );
}
