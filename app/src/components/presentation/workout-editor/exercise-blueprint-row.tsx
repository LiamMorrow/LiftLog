import IconButton from '@/components/presentation/foundation/icon-button';
import Menu from '@/components/presentation/foundation/menu';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { SupersetBadge } from '@/components/presentation/workout/superset-group';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import {
  CardioExerciseBlueprint,
  ExerciseBlueprint,
  formatRepsTarget,
  Rest,
  uniformTarget,
  WeightedExerciseBlueprint,
} from '@/models/blueprint-models';
import { formatCardioTarget } from '@/utils/format-cardio-target';
import { formatTimeSpan } from '@/utils/format-time-span';
import CopyAll from '@expo/material-symbols/copy_all.xml';
import Delete from '@expo/material-symbols/delete.xml';
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { match, P } from 'ts-pattern';

interface ExerciseBlueprintRowProps {
  blueprint: ExerciseBlueprint;
  supersetLabel: string | undefined;
  reordering: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onCopyTo: () => void;
}

export function ExerciseBlueprintRow(props: ExerciseBlueprintRowProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const detail = match(props.blueprint)
    .with(P.instanceOf(WeightedExerciseBlueprint), (b) =>
      t('exercise.planned_with_rest.label', { sets: formatPlannedSets(b), rest: formatRest(b.restBetweenSets) }),
    )
    .with(P.instanceOf(CardioExerciseBlueprint), (b) => b.sets.map((set) => formatCardioTarget(set.target)).join(' · '))
    .exhaustive();

  return (
    <TouchableRipple testID="exercise-blueprint-row" onPress={props.reordering ? undefined : props.onEdit}>
      <View
        style={{
          minHeight: spacing[16],
          paddingVertical: spacing[2],
          paddingLeft: spacing[4],
          paddingRight: spacing[1],
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[3],
        }}
      >
        <View style={{ flex: 1, gap: spacing[0.5] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
            {props.supersetLabel ? <SupersetBadge label={props.supersetLabel} /> : undefined}
            <Text variant="titleMedium" style={{ flexShrink: 1 }}>
              {props.blueprint.name}
            </Text>
          </View>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
            {detail}
          </Text>
        </View>
        {props.reordering ? (
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon="arrowUpward"
              disabled={!props.canMoveUp}
              accessibilityLabel={t('generic.move_up.button')}
              onPress={props.onMoveUp}
            />
            <IconButton
              icon="arrowDownward"
              disabled={!props.canMoveDown}
              accessibilityLabel={t('generic.move_down.button')}
              onPress={props.onMoveDown}
            />
          </View>
        ) : (
          <Menu
            trigger={(open) => (
              <IconButton icon="moreHoriz" accessibilityLabel={t('generic.more_options.button')} onPress={open} />
            )}
            items={[
              {
                label: t('exercise.copy_to.button'),
                icon: CopyAll,
                systemImage: 'doc.on.clipboard',
                onPress: props.onCopyTo,
              },
              {
                label: t('generic.remove.button'),
                icon: Delete,
                systemImage: 'trash',
                onPress: props.onRemove,
              },
            ]}
          />
        )}
      </View>
    </TouchableRipple>
  );
}

function formatPlannedSets(blueprint: WeightedExerciseBlueprint) {
  const uniform = uniformTarget(blueprint.plannedSets);
  return uniform
    ? `${blueprint.plannedSets.length} × ${formatRepsTarget(uniform)}`
    : blueprint.plannedSets.map((set) => formatRepsTarget(set.reps)).join('/');
}

function formatRest(rest: Rest) {
  return rest.minRest.compareTo(rest.maxRest) >= 0
    ? formatTimeSpan(rest.minRest)
    : `${formatTimeSpan(rest.minRest)} - ${formatTimeSpan(rest.maxRest)}`;
}
