import FixedIncrementer from '@/components/presentation/fixed-incrementer';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ExerciseBlueprint } from '@/models/blueprint-models';
import { useTranslate } from '@tolgee/react';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Card, TextInput } from 'react-native-paper';

interface ExerciseEditorProps {
  exercise: ExerciseBlueprint;
  updateExercise: (ex: ExerciseBlueprint) => void;
}

export function ExerciseEditor(props: ExerciseEditorProps) {
  const { exercise: propsExercise, updateExercise: updatePropsExercise } =
    props;
  const [exercise, setExercise] = useState(propsExercise);
  const { spacing, font } = useAppTheme();
  const { t } = useTranslate();

  // Bit of a hack to let us update exercise immediately without going through the whole props loop
  useEffect(() => {
    setExercise(propsExercise);
  }, [propsExercise]);
  const updateExercise = (ex: Partial<ExerciseBlueprint>) => {
    setExercise({ ...exercise, ...ex });
    updatePropsExercise({ ...exercise, ...ex });
  };

  const incrementSets = () => {
    updateExercise({ sets: exercise.sets + 1 });
  };

  const decrementSets = () => {
    updateExercise({ sets: Math.max(exercise.sets - 1, 0) });
  };

  const incrementReps = () => {
    updateExercise({ repsPerSet: exercise.repsPerSet + 1 });
  };

  const decrementReps = () => {
    updateExercise({ repsPerSet: Math.max(exercise.repsPerSet - 1, 0) });
  };

  return (
    <View style={{ gap: spacing[2] }}>
      <TextInput
        label={t('Exercise')}
        data-cy="exercise-name"
        style={{ marginBottom: spacing[2] }}
        value={exercise.name}
        onChangeText={(name) => updateExercise({ name })}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          gap: spacing[4],
        }}
      >
        <Card
          style={{
            flexGrow: 1,
            flex: 1,
            paddingVertical: spacing[5],
            justifyContent: 'center',
          }}
        >
          <Card.Content>
            <FixedIncrementer
              label={t('Sets')}
              increment={incrementSets}
              decrement={decrementSets}
              value={exercise.sets}
              data-cy="exercise-sets"
            />
          </Card.Content>
        </Card>
        <Card
          style={{
            flexGrow: 1,
            flex: 1,
            paddingVertical: spacing[5],
            justifyContent: 'center',
          }}
        >
          <Card.Content>
            <FixedIncrementer
              label={t('Reps')}
              increment={incrementReps}
              decrement={decrementReps}
              value={exercise.repsPerSet}
              data-cy="exercise-reps"
            />
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}
