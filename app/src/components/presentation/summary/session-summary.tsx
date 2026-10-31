import { ExerciseSummaryLine } from '@/components/presentation/summary/exercise-summary-line';
import { ColorChoice, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Session } from '@/models/session-models';
import { groupSupersets } from '@/utils/superset-groups';
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
  const rowGap = showSets ? spacing[2] : spacing[1];
  const groups = groupSupersets(session.recordedExercises)
    .map((group) => ({
      ...group,
      members: group.members.filter(({ index }) => session.recordedExercises[index]!.isStarted || !isFilled),
    }))
    .filter((group) => group.members.length);

  return (
    <View style={{ gap: rowGap }} testID="session-summary">
      {groups.map((group, groupIndex) => (
        <View
          key={group.members[0]!.index}
          style={
            showSets && {
              borderTopWidth: groupIndex === 0 ? 1 : 0,
              borderBottomWidth: 1,
              borderColor: colorScheme === 'light' ? colors.outlineVariant : colors.outline,
              paddingTop: groupIndex === 0 ? spacing[2] : 0,
              paddingBottom: spacing[2],
            }
          }
        >
          <View style={{ gap: rowGap }}>
            {group.isSuperset && group.members.length > 1 && (
              <View
                style={{
                  position: 'absolute',
                  left: -(spacing.pageHorizontalMargin + spacing[1]) / 2,
                  top: 0,
                  bottom: 0,
                  width: spacing[1],
                  borderRadius: spacing[0.5],
                  backgroundColor: colors.tertiary,
                }}
              />
            )}
            {group.members.map(({ index }) => (
              <ExerciseSummaryLine
                key={index}
                exercise={session.recordedExercises[index]!}
                isFilled={!!isFilled}
                showWeight={!!showWeight}
                showSets={!!showSets}
                color={color}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
