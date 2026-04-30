import ActiveQuestPanel from '@/components/presentation/rpg/ActiveQuestPanel';
import AchievementsRow from '@/components/presentation/rpg/AchievementsRow';
import CharacterCard from '@/components/presentation/rpg/CharacterCard';
import StatAttributeCard from '@/components/presentation/rpg/StatAttributeCard';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { selectSessions } from '@/store/stored-sessions';
import {
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import { YearMonth } from '@js-joda/core';
import { Stack } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';

function isoWeekKey(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function currentWeekKey(): string {
  return isoWeekKey(new Date().toISOString().slice(0, 10));
}

function completedSetsInSession(session: Session): number {
  let count = 0;
  for (const ex of session.recordedExercises) {
    if (ex instanceof RecordedWeightedExercise) {
      for (const ps of ex.potentialSets) {
        if (ps.set !== undefined) count++;
      }
    }
  }
  return count;
}

export default function DashboardPage() {
  const { colors } = useAppTheme();
  const allSessions = useAppSelector(selectSessions);
  const streakDays = useAppSelector((s) => s.rpg.streakDays);

  const weekKey = currentWeekKey();
  const currentMonth = YearMonth.now();

  const { setsThisWeek, minutesThisMonth, distinctExercisesThisWeek } =
    useMemo(() => {
      const weekSessions = allSessions.filter(
        (s) => isoWeekKey(s.date.toString()) === weekKey,
      );
      const monthSessions = allSessions.filter((s) =>
        YearMonth.from(s.date).equals(currentMonth),
      );

      const sets = weekSessions.reduce(
        (sum, s) => sum + completedSetsInSession(s),
        0,
      );

      const minutes = monthSessions.reduce((sum, s) => {
        const d = s.duration;
        if (!d) return sum;
        return sum + Math.floor(Number(d.seconds()) / 60);
      }, 0);

      const exerciseNames = new Set(
        weekSessions.flatMap((s) =>
          s.recordedExercises.map((ex) => ex.blueprint.name),
        ),
      );

      return {
        setsThisWeek: sets,
        minutesThisMonth: minutes,
        distinctExercisesThisWeek: exerciseNames.size,
      };
    }, [allSessions, weekKey, currentMonth]);

  return (
    <>
      <Stack.Screen options={{ title: 'Dashboard' }} />
      <ScrollView
        contentContainerStyle={{
          gap: spacing[4],
          paddingHorizontal: spacing.pageHorizontalMargin,
          paddingBottom: spacing[8],
        }}
      >
        <CharacterCard />

        <View style={{ gap: spacing[2] }}>
          <Text
            variant="labelSmall"
            style={{ color: colors.onSurfaceVariant, letterSpacing: 1 }}
          >
            ATRIBUTOS
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing[2] }}>
            <StatAttributeCard
              abbr="FOR"
              label="Força"
              value={String(setsThisWeek)}
              subtitle="séries esta semana"
              icon="fitnessCenter"
              color={colors.red}
            />
            <StatAttributeCard
              abbr="RES"
              label="Resistência"
              value={`${minutesThisMonth}min`}
              subtitle="treino este mês"
              icon="timer"
              color={colors.blue}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing[2] }}>
            <StatAttributeCard
              abbr="VIT"
              label="Vitalidade"
              value={`${streakDays}d`}
              subtitle="streak atual"
              icon="localFireDepartment"
              color={colors.green}
            />
            <StatAttributeCard
              abbr="DES"
              label="Destreza"
              value={String(distinctExercisesThisWeek)}
              subtitle="exercícios distintos"
              icon="bolt"
              color={colors.amber}
            />
          </View>
        </View>

        <ActiveQuestPanel />

        <AchievementsRow />
      </ScrollView>
    </>
  );
}
