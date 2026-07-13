import ExerciseSummary from '@/components/presentation/summary/exercise-summary';
import { ExerciseSummaryLine } from '@/components/presentation/summary/exercise-summary-line';
import { ColorChoice, spacing } from '@/hooks/useAppTheme';
import { Session } from '@/models/session-models';
import { View } from 'react-native';

interface SessionSummaryProps {
  session: Session;
  isFilled?: boolean;
  showWeight?: boolean;
  color?: ColorChoice;
  /** `chips` keeps the scrolling per-set chips, for surfaces that are worked from rather than read. */
  variant?: 'chips' | 'text';
}
export default function SessionSummary({
  session,
  isFilled,
  showWeight,
  color = 'onSurface',
  variant = 'text',
}: SessionSummaryProps) {
  return (
    <View style={{ gap: variant === 'text' ? spacing[1] : spacing[2] }} testID="session-summary">
      {session.recordedExercises
        .filter((x) => x.isStarted || !isFilled)
        .map((ex, index) =>
          variant === 'text' ? (
            <ExerciseSummaryLine
              key={index}
              exercise={ex}
              isFilled={!!isFilled}
              showWeight={!!showWeight}
              color={color}
            />
          ) : (
            <ExerciseSummary
              key={index}
              exercise={ex}
              isFilled={!!isFilled}
              showName={true}
              showWeight={!!showWeight}
              showDate={false}
              color={color}
            />
          ),
        )}
    </View>
  );
}
