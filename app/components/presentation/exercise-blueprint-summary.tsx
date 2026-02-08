import ItemTitle from '@/components/presentation/item-title';
import RestFormat, {
  formatTimeSpan,
} from '@/components/presentation/rest-format';
import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useState } from 'react';
import { Image, View } from 'react-native';
import { Card, Menu } from 'react-native-paper';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import TouchableRipple from '@/components/presentation/gesture-wrappers/touchable-ripple';
import { useTranslate } from '@tolgee/react';
import {
  CardioExerciseBlueprint,
  CardioTarget,
  ExerciseBlueprint,
  WeightedExerciseBlueprint,
} from '@/models/blueprint-models';
import { match, P } from 'ts-pattern';
import { assertUnreachable } from '@/utils/assert-unreachable';
import { formatDistance } from '@/utils/distance';
import LimitedHtml from '@/components/presentation/limited-html';

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
  const [menuOpen, setMenuOpen] = useState(false);

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
              visible={menuOpen}
              onDismiss={() => setMenuOpen(false)}
              anchor={
                <IconButton
                  onPress={() => setMenuOpen(true)}
                  icon={'moreHoriz'}
                />
              }
            >
              <Menu.Item
                title={t('exercise.copy_to.button')}
                leadingIcon={'copyAll'}
                onPress={() => {
                  setMenuOpen(false);
                  onCopyTo();
                }}
              />
            </Menu>
          </View>
        </View>

        {blueprint.imageUri && (
          <Card
            mode="elevated"
            style={{
              marginTop: spacing[2],
              marginBottom: spacing[2],
              overflow: 'hidden',
            }}
            elevation={1}
          >
            <Image
              source={{ uri: blueprint.imageUri }}
              style={{ width: '100%', height: 150 }}
              resizeMode="contain"
            />
          </Card>
        )}
        {match(blueprint)
          .with(P.instanceOf(WeightedExerciseBlueprint), (b) => (
            <WeightedExerciseBlueprintSummary blueprint={b} />
          ))
          .with(P.instanceOf(CardioExerciseBlueprint), (b) => (
            <CardioExerciseBlueprintSummary blueprint={b} />
          ))
          .exhaustive()}
      </View>
    </TouchableRipple>
  );
}

function CardioExerciseBlueprintSummary({
  blueprint,
}: {
  blueprint: CardioExerciseBlueprint;
}) {
  const { t } = useTranslate();

  return (
    <View style={{ gap: spacing[1], alignItems: 'flex-start' }}>
      {blueprint.sets.map((set, i) => (
        <LimitedHtml
          key={i}
          value={t('exercise.description.cardio_set.body', {
            setNumber: i + 1,
            timeOrDistance: t(
              set.target.type === 'time'
                ? 'generic.time.label'
                : 'exercise.distance.label',
            ),
            timeOrDistanceValue: formatCardioTarget(set.target),
          })}
        />
      ))}
    </View>
  );
}

export function formatCardioTarget(target: CardioTarget): string {
  if (target.type === 'distance') {
    return formatDistance(target.value);
  } else if (target.type === 'time') {
    return formatTimeSpan(target.value);
  }
  assertUnreachable(target);
}

function WeightedExerciseBlueprintSummary({
  blueprint,
}: {
  blueprint: WeightedExerciseBlueprint;
}) {
  return (
    <View style={{ gap: spacing[1], alignItems: 'flex-start' }}>
      <SurfaceText>
        <SurfaceText color="primary">{blueprint.sets}</SurfaceText>{' '}
        {pluralize(blueprint.sets, 'set')} of{' '}
        <SurfaceText color="primary">{blueprint.repsPerSet}</SurfaceText>{' '}
        {pluralize(blueprint.repsPerSet, 'rep')}
      </SurfaceText>
      <SurfaceText>
        <RestFormat rest={blueprint.restBetweenSets} />
      </SurfaceText>
    </View>
  );
}

function pluralize(count: number, text: string): string {
  return count === 1 ? text : text + 's';
}
