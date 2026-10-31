import { SegmentedList, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { translateExerciseMeta } from '@/utils/exercise-meta';
import { MuscleContribution, MuscleVolume } from '@/utils/muscle-volume';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export function MuscleVolumeList(props: { muscles: MuscleVolume[] }) {
  const [expanded, setExpanded] = useState<string>();
  const topSets = props.muscles[0]?.sets ?? 0;

  return (
    <SegmentedList
      items={props.muscles}
      itemKey={(volume) => volume.muscle}
      renderItem={(volume) => (
        <MuscleVolumeRow
          volume={volume}
          fraction={topSets ? volume.sets / topSets : 0}
          expanded={expanded === volume.muscle}
          onPress={
            volume.contributions.length
              ? () => setExpanded(expanded === volume.muscle ? undefined : volume.muscle)
              : undefined
          }
        />
      )}
    />
  );
}

function MuscleVolumeRow(props: {
  volume: MuscleVolume;
  fraction: number;
  expanded: boolean;
  onPress: (() => void) | undefined;
}) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const { volume } = props;
  const untrained = volume.sets === 0;
  const textColor = untrained ? colors.onSurfaceVariant : colors.onSurface;

  return (
    <SegmentListFormElement
      label={<Text style={{ color: textColor }}>{translateExerciseMeta(t, 'muscle', volume.muscle)}</Text>}
      right={
        <Text variant="labelLarge" style={{ color: textColor }}>
          {volume.sets.toLocaleString()}
        </Text>
      }
      onPress={props.onPress}
      line2={
        <View style={{ gap: spacing[3], marginBlockStart: spacing[2] }}>
          <View
            style={{
              height: spacing[2],
              borderRadius: spacing[1],
              backgroundColor: colors.outlineVariant,
              overflow: 'hidden',
            }}
          >
            <View style={{ width: `${props.fraction * 100}%`, height: '100%', backgroundColor: colors.primary }} />
          </View>
          {props.expanded && volume.contributions.map((c) => <ContributionRow key={c.exerciseName} contribution={c} />)}
        </View>
      }
    />
  );
}

function ContributionRow({ contribution }: { contribution: MuscleContribution }) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing[2] }}>
      <Text variant="bodySmall" style={{ flex: 1, color: colors.onSurfaceVariant }}>
        {contribution.exerciseName}
      </Text>
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
        {contribution.sets.toLocaleString()} ·{' '}
        {contribution.secondary ? t('plan.muscle_analysis.secondary.label') : t('plan.muscle_analysis.primary.label')}
      </Text>
    </View>
  );
}
