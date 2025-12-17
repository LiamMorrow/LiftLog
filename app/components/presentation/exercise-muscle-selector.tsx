import { spacing } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { selectMuscles } from '@/store/stored-sessions';
import { T } from '@tolgee/react';
import { View } from 'react-native';
import { Chip, Text } from 'react-native-paper';

export default function ExerciseMuscleSelector(props: {
  muscles: string[];
  onChange: (muscles: string[]) => void;
}) {
  const { muscles, onChange } = props;
  const muscleList = useAppSelector(selectMuscles);
  return (
    <View style={{ gap: spacing[2] }}>
      <Text variant="labelLarge">
        <T keyName="muscles.muscle.label" />
      </Text>
      <View
        style={{
          flexDirection: 'row',
          gap: spacing[1],
          flexWrap: 'wrap',
        }}
      >
        {muscleList.map((x) => (
          <Chip
            mode="outlined"
            key={x}
            onPress={() => {
              onChange(
                muscles.includes(x)
                  ? muscles.filter((musc) => musc !== x)
                  : muscles.concat([x]),
              );
            }}
            showSelectedOverlay
            selected={muscles.includes(x)}
            testID={`exercise-muscle-chip`}
          >
            {x}
          </Chip>
        ))}
      </View>
    </View>
  );
}
