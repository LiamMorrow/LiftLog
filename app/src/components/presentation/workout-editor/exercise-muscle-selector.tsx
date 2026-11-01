import { Icon } from '@/components/presentation/foundation/icon';
import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import { MuscleMap } from '@/components/presentation/muscles/muscle-map';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { selectMuscles } from '@/store/stored-sessions';
import { T, useTranslate } from '@tolgee/react';
import { translateExerciseMeta } from '@/utils/exercise-meta';
import { secondaryMuscleWeight } from '@/utils/muscle-volume';
import { View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { Chip } from '@/components/presentation/foundation/chip';

export default function ExerciseMuscleSelector(props: {
  muscles: string[];
  onChange: (muscles: string[], secondaryMuscles: string[]) => void;
  secondaryMuscles?: string[];
  showMuscleMap?: boolean;
}) {
  const { muscles, onChange } = props;
  const secondaryMuscles = props.secondaryMuscles ?? [];
  const canMarkSecondary = props.secondaryMuscles !== undefined;
  const { t } = useTranslate();
  const muscleList = useAppSelector(selectMuscles);

  const toggle = (muscle: string) => {
    if (!muscles.includes(muscle)) {
      onChange(muscles.concat([muscle]), secondaryMuscles);
    } else if (canMarkSecondary && !secondaryMuscles.includes(muscle)) {
      onChange(muscles, secondaryMuscles.concat([muscle]));
    } else {
      onChange(
        muscles.filter((x) => x !== muscle),
        secondaryMuscles.filter((x) => x !== muscle),
      );
    }
  };

  return (
    <View style={{ gap: spacing[2] }}>
      <AppText variant="labelLarge">
        <T keyName="muscles.muscle.label" />
      </AppText>
      {canMarkSecondary && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[4] }}>
          <KeyItem icon="check" label={t('muscles.primary.label')} />
          <KeyItem icon="contrast" label={t('muscles.secondary.label')} />
        </View>
      )}
      <View
        style={{
          flexDirection: 'row',
          gap: spacing[1],
          flexWrap: 'wrap',
        }}
      >
        {muscleList.map((x) => {
          const isSecondary = secondaryMuscles.includes(x);
          return (
            <Chip
              mode="outlined"
              key={x}
              onPress={() => toggle(x)}
              selected={muscles.includes(x)}
              showSelectedCheck={!isSecondary}
              icon={isSecondary ? 'contrast' : undefined}
              testID={`exercise-muscle-chip`}
            >
              {translateExerciseMeta(t, 'muscle', x)}
            </Chip>
          );
        })}
      </View>
      {props.showMuscleMap && (
        <MuscleMap
          intensities={Object.fromEntries(
            muscles.map((muscle) => [muscle, secondaryMuscles.includes(muscle) ? secondaryMuscleWeight : 1]),
          )}
          style={{ width: 200, alignSelf: 'center', marginTop: spacing[2] }}
        />
      )}
    </View>
  );
}

function KeyItem(props: { icon: AppIconSource; label: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
      <Icon source={props.icon} size={16} color={colors.onSurfaceVariant} />
      <AppText variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
        {props.label}
      </AppText>
    </View>
  );
}
