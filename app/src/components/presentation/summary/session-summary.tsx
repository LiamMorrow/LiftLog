import { ExerciseSummaryLine } from '@/components/presentation/summary/exercise-summary-line';
import { ColorChoice, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Session } from '@/models/session-models';
import { View } from 'react-native';

interface SessionSummaryProps {
  session: Session;
  isFilled?: boolean;
  showWeight?: boolean;
  showSets?: boolean;
  color?: ColorChoice;
}
export default function SessionSummary({
  session,
  isFilled,
  showWeight,
  showSets,
  color = 'onSurface',
}: SessionSummaryProps) {
  const { colors, colorScheme } = useAppTheme();
  return (
    <View style={{ gap: showSets ? spacing[2] : spacing[1] }} testID="session-summary">
      {session.recordedExercises
        .filter((x) => x.isStarted || !isFilled)
        .map((ex, index) => (
          <View
            key={index}
            style={
              showSets && {
                borderBottomWidth: 1,
                borderColor: colorScheme === 'light' ? colors.outlineVariant : colors.outline,
                paddingBottom: spacing[2],
              }
            }
          >
            <ExerciseSummaryLine
              exercise={ex}
              isFilled={!!isFilled}
              showWeight={!!showWeight}
              showSets={!!showSets}
              color={color}
            />
          </View>
        ))}
    </View>
  );
}
