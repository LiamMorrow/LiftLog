import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import {
  RecordedCardioExercise,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

function computeXpPreview(session: Session): number {
  let xp = 50;
  for (const ex of session.recordedExercises) {
    if (ex instanceof RecordedWeightedExercise) {
      for (const ps of ex.potentialSets) {
        if (ps.set !== undefined) xp += 10;
      }
    } else if (ex instanceof RecordedCardioExercise) {
      if (ex.completionDateTime !== undefined) xp += 15;
    }
  }
  return xp;
}

interface QuestLogItemProps {
  session: Session;
  children: ReactNode;
}

export default function QuestLogItem({ session, children }: QuestLogItemProps) {
  const { colors } = useAppTheme();
  const xpEarned = computeXpPreview(session);

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing[1],
          marginBottom: spacing[1],
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[1],
          }}
        >
          <Icon source="menuBook" size={12} color={colors.primary} />
          <Text
            variant="labelSmall"
            style={{ color: colors.primary, letterSpacing: 1 }}
          >
            MISSÃO COMPLETA
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[1],
          }}
        >
          <Icon source="star" size={12} color={colors.amber} />
          <Text variant="labelSmall" style={{ color: colors.amber }}>
            +{xpEarned} XP
          </Text>
        </View>
      </View>
      {children}
    </View>
  );
}
