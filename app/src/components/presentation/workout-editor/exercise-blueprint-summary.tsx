import ItemTitle from '@/components/presentation/foundation/item-title';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { View } from 'react-native';
import Menu from '@/components/presentation/foundation/menu';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
import TouchableRipple from '@/components/presentation/foundation/gesture-wrappers/touchable-ripple';
import { useTranslate } from '@tolgee/react';
import {
  CardioExerciseBlueprint,
  ExerciseBlueprint,
  formatRepsTarget,
  matchCardioTarget,
  WeightedExerciseBlueprint,
} from '@/models/blueprint-models';
import { match, P } from 'ts-pattern';
import { formatCardioTarget } from '@/utils/format-cardio-target';
import LimitedHtml from '@/components/presentation/foundation/limited-html';

interface ExerciseBlueprintSummaryProps {
  blueprint: ExerciseBlueprint;
  onEdit: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemove: () => void;
  onCopyTo: () => void;
}

export default function ExerciseBlueprintSummary({
  blueprint,
  onEdit,
  onMoveDown,
  onMoveUp,
  onRemove,
  onCopyTo,
}: ExerciseBlueprintSummaryProps) {
  const { t } = useTranslate();

  return (
    <TouchableRipple
      testID="exercise-blueprint-summary"
      onPress={onEdit}
      style={{
        paddingHorizontal: spacing.pageHorizontalMargin,
        paddingVertical: spacing[4],
      }}
    >
      <View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <ItemTitle title={blueprint.name} />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <IconButton onPress={onMoveUp} icon={'arrowUpward'} />
            <IconButton onPress={onMoveDown} icon={'arrowDownward'} />
            <IconButton onPress={onRemove} icon={'delete'} />
            <Menu
              trigger={(open) => <IconButton onPress={open} icon={'moreHoriz'} />}
              items={[
                {
                  label: t('exercise.copy_to.button'),
                  icon: 'copyAll',
                  systemImage: 'doc.on.clipboard',
                  onPress: onCopyTo,
                },
              ]}
            />
          </View>
        </View>
        {match(blueprint)
          .with(P.instanceOf(WeightedExerciseBlueprint), (b) => <WeightedExerciseBlueprintSummary blueprint={b} />)
          .with(P.instanceOf(CardioExerciseBlueprint), (b) => <CardioExerciseBlueprintSummary blueprint={b} />)
          .exhaustive()}
      </View>
    </TouchableRipple>
  );
}

function CardioExerciseBlueprintSummary({ blueprint }: { blueprint: CardioExerciseBlueprint }) {
  const { t } = useTranslate();

  return (
    <View style={{ gap: spacing[1], alignItems: 'flex-start' }}>
      {blueprint.sets.map((set, i) => (
        <LimitedHtml
          key={i}
          value={t('exercise.description.cardio_set.body', {
            setNumber: i + 1,
            targetType: matchCardioTarget(set.target, {
              time: () => t('generic.time.label'),
              distance: () => t('exercise.distance.label'),
            }),
            targetValue: formatCardioTarget(set.target),
          })}
        />
      ))}
    </View>
  );
}

export { formatCardioTarget };

function WeightedExerciseBlueprintSummary({ blueprint }: { blueprint: WeightedExerciseBlueprint }) {
  return (
    <View style={{ gap: spacing[1], alignItems: 'flex-start' }}>
      <SurfaceText>
        {match(blueprint.repsConfig)
          .with({ type: 'fixed' }, (c) => (
            <>
              <SurfaceText color="primary">{blueprint.sets}</SurfaceText> {pluralize(blueprint.sets, 'set')} of{' '}
              <SurfaceText color="primary">{c.reps}</SurfaceText> {pluralize(c.reps, 'rep')}
            </>
          ))
          .with({ type: 'range' }, (c) => (
            <>
              <SurfaceText color="primary">{blueprint.sets}</SurfaceText> {pluralize(blueprint.sets, 'set')} of{' '}
              <SurfaceText color="primary">
                {c.min}–{c.max}
              </SurfaceText>{' '}
              reps
            </>
          ))
          .with({ type: 'perSet' }, (c) => (
            <>
              <SurfaceText color="primary">{blueprint.sets}</SurfaceText> {pluralize(blueprint.sets, 'set')}:{' '}
              <SurfaceText color="primary">{c.targets.map(formatRepsTarget).join(' / ')}</SurfaceText> reps
            </>
          ))
          .exhaustive()}
      </SurfaceText>
    </View>
  );
}

function pluralize(count: number, text: string): string {
  return count === 1 ? text : text + 's';
}
