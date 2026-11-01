import { NativeIconButton } from '@/components/presentation/foundation/native-icon-button';
import ArrowUpwardIcon from '@expo/material-symbols/arrow_upward.xml';
import ArrowDownwardIcon from '@expo/material-symbols/arrow_downward.xml';
import MoreHorizIcon from '@expo/material-symbols/more_horiz.xml';
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
import { AppText } from '@/components/presentation/foundation/app-text';
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
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: spacing[1] }}>
      <TouchableRipple
        testID="exercise-blueprint-row"
        onPress={props.reordering ? undefined : props.onEdit}
        style={{ flex: 1, alignSelf: 'stretch' }}
      >
        <View
          style={{
            flex: 1,
            minHeight: spacing[16],
            justifyContent: 'center',
            paddingVertical: spacing[2],
            paddingLeft: spacing[4],
            paddingRight: spacing[3],
            gap: spacing[0.5],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
            {props.supersetLabel ? <SupersetBadge label={props.supersetLabel} /> : undefined}
            <AppText variant="titleMedium" style={{ flexShrink: 1 }}>
              {props.blueprint.name}
            </AppText>
          </View>
          <AppText variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
            {detail}
          </AppText>
        </View>
      </TouchableRipple>
      {props.reordering ? (
        <View style={{ flexDirection: 'row' }}>
          <NativeIconButton
            icon={ArrowUpwardIcon}
            systemImage="arrow.up"
            disabled={!props.canMoveUp}
            label={t('generic.move_up.button')}
            onPress={props.onMoveUp}
          />
          <NativeIconButton
            icon={ArrowDownwardIcon}
            systemImage="arrow.down"
            disabled={!props.canMoveDown}
            label={t('generic.move_down.button')}
            onPress={props.onMoveDown}
          />
        </View>
      ) : (
        <Menu
          trigger={{
            icon: MoreHorizIcon,
            systemImage: 'ellipsis',
            label: t('generic.more_options.button'),
          }}
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
