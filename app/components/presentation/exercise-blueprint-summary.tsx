import ItemTitle from '@/components/presentation/item-title';
import RestFormat from '@/components/presentation/rest-format';
import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { ExerciseBlueprint } from '@/models/session-models';
import { View } from 'react-native';
import { IconButton, TouchableRipple } from 'react-native-paper';

interface ExerciseBlueprintSummaryProps {
  blueprint: ExerciseBlueprint;
  onEdit: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemove: () => void;
}

export default function ExerciseBlueprintSummary({
  blueprint,
  onEdit,
  onMoveDown,
  onMoveUp,
  onRemove,
}: ExerciseBlueprintSummaryProps) {
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
          </View>
        </View>
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
      </View>
    </TouchableRipple>
  );
}

function pluralize(count: number, text: string): string {
  return count === 1 ? text : text + 's';
}
