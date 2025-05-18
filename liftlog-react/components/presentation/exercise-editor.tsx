import EditableIncrementer from '@/components/presentation/editable-incrementer';
import FixedIncrementer from '@/components/presentation/fixed-incrementer';
import ListSwitch from '@/components/presentation/list-switch';
import RestEditorGroup from '@/components/presentation/rest-editor-group';
import { spacing } from '@/hooks/useAppTheme';
import { ExerciseBlueprint } from '@/models/session-models';
import { RootState, useAppSelector } from '@/store';
import { useTranslate } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Card, Divider, TextInput } from 'react-native-paper';

interface ExerciseEditorProps {
  exercise: ExerciseBlueprint;
  updateExercise: (ex: ExerciseBlueprint) => void;
}

export function ExerciseEditor(props: ExerciseEditorProps) {
  const { exercise: propsExercise, updateExercise: updatePropsExercise } =
    props;
  const [exercise, setExercise] = useState(propsExercise);
  const { t } = useTranslate();

  // Bit of a hack to let us update exercise immediately without going through the whole props loop
  useEffect(() => {
    setExercise(propsExercise);
  }, [propsExercise]);
  const updateExercise = (ex: Partial<ExerciseBlueprint>) => {
    const update = ExerciseBlueprint.fromPOJO({ ...exercise.toPOJO(), ...ex });
    setExercise(update);
    updatePropsExercise(update);
  };
  const useImperialUnits = useAppSelector(
    (s: RootState) => s.settings.useImperialUnits,
  );
  const weightSuffix = useImperialUnits ? 'lb' : 'kg';

  const incrementSets = () => updateExercise({ sets: exercise.sets + 1 });

  const decrementSets = () =>
    updateExercise({ sets: Math.max(exercise.sets - 1, 0) });

  const incrementReps = () =>
    updateExercise({ repsPerSet: exercise.repsPerSet + 1 });

  const decrementReps = () =>
    updateExercise({ repsPerSet: Math.max(exercise.repsPerSet - 1, 0) });

  const setExerciseNotes = (notes: string) => updateExercise({ notes });

  const setExerciseLink = (link: string) => updateExercise({ link });

  const setExerciseWeightIncrease = (weightIncreaseOnSuccess: BigNumber) =>
    updateExercise({ weightIncreaseOnSuccess });

  return (
    <View style={{ gap: spacing[2] }}>
      <TextInput
        label={t('Exercise')}
        data-cy="exercise-name"
        style={{ marginBottom: spacing[2] }}
        value={exercise.name}
        onChangeText={(name) => updateExercise({ name })}
        selectTextOnFocus={true}
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

      <TextInput
        label={t('PlanNotes')}
        data-cy="exercise-notes"
        style={{ marginBottom: spacing[2] }}
        value={exercise.notes}
        onChangeText={setExerciseNotes}
        multiline
      />

      <TextInput
        label={t('ExternalLink')}
        data-cy="exercise-link"
        style={{ marginBottom: spacing[2] }}
        placeholder="https://"
        value={exercise.link}
        onChangeText={setExerciseLink}
      />

      <View style={{ gap: spacing[4] }}>
        <Card mode="elevated">
          <Card.Content style={{ gap: spacing[6] }}>
            <EditableIncrementer
              increment={new BigNumber('0.1')}
              label={t('ProgressiveOverload')}
              data-cy="exercist-auto-increase"
              suffix={weightSuffix}
              value={exercise.weightIncreaseOnSuccess}
              onChange={setExerciseWeightIncrease}
            />
            <Divider />
            <View style={{ width: '100%' }}>
              <ListSwitch
                headline={t('SupersetNextExercise')}
                value={exercise.supersetWithNext}
                supportingText=""
                data-cy="exercise-superset"
                onValueChange={(supersetWithNext) =>
                  updateExercise({ supersetWithNext })
                }
              />
            </View>
            <Divider />
            <RestEditorGroup
              rest={exercise.restBetweenSets}
              onRestUpdated={(restBetweenSets) =>
                updateExercise({ restBetweenSets })
              }
            />
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}
