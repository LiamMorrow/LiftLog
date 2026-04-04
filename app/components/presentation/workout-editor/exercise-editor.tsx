import DurationEditor from '@/components/presentation/foundation/editors/duration-editor';
import EditableIncrementer from '@/components/presentation/foundation/editors/editable-incrementer';
import FixedIncrementer from '@/components/presentation/foundation/editors/fixed-incrementer';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import LabelledForm from '@/components/presentation/foundation/labelled-form';
import LabelledFormRow from '@/components/presentation/foundation/labelled-form-row';
import ListSwitch from '@/components/presentation/foundation/list-switch';
import RestEditorGroup from '@/components/presentation/workout-editor/rest-editor-group';
import SelectButton from '@/components/presentation/foundation/select-button';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import {
  CardioExerciseBlueprint,
  CardioExerciseBlueprintPOJO,
  CardioExerciseSetBlueprint,
  CardioTarget,
  DistanceCardioTarget,
  DistanceUnits,
  ExerciseBlueprint,
  matchCardioTarget,
  TimeCardioTarget,
  WeightedExerciseBlueprint,
  WeightedExerciseBlueprintPOJO,
} from '@/models/blueprint-models';
import { useAppSelector } from '@/store';
import { ExerciseDescriptor } from '@/store/stored-sessions';
import { assertUnreachable } from '@/utils/assert-unreachable';
import { Duration } from '@js-joda/core';
import { T, useTranslate } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  Card,
  Divider,
  List,
  SegmentedButtons,
  Text,
  TextInput,
} from 'react-native-paper';
import { match, P } from 'ts-pattern';

interface ExerciseEditorProps {
  exercise: ExerciseBlueprint;
  updateExercise: (ex: ExerciseBlueprint) => void;
}
interface ExerciseSuggestion extends ExerciseDescriptor {
  source: 'user' | 'base';
}

const builtInExercisesJson = require('../../../assets/exercises.json') as {
  exercises: { name: string }[];
};
const builtInExerciseIds = new Set(
  builtInExercisesJson.exercises.map((exercise) => exercise.name),
);

const distanceUnitOptions = DistanceUnits.map((value) => ({
  value,
  label: value + 's',
}));
export function ExerciseEditor(props: ExerciseEditorProps) {
  const suggestedExercises = useAppSelector((state) => {
    const allExercises = new Map<string, ExerciseSuggestion>();
    const addExerciseDescriptor = (
      exercise: ExerciseDescriptor,
      source: ExerciseSuggestion['source'],
    ) => {
      const id = exercise.name.trim().toLocaleLowerCase();
      if (!id) {
        return;
      }
      const existing = allExercises.get(id);
      if (existing && (existing.source === 'user' || source === 'base')) {
        return;
      }
      allExercises.set(id, { ...exercise, source });
    };
    const addBlueprintExercise = (exercise: ExerciseBlueprint) => {
      addExerciseDescriptor(
        {
          name: exercise.name,
          force: null,
          level: 'beginner',
          mechanic: null,
          equipment: null,
          muscles: [],
          instructions: exercise.notes,
          category:
            exercise instanceof CardioExerciseBlueprint ? 'cardio' : 'strength',
        },
        'user',
      );
    };

    Object.entries(state.storedSessions.savedExercises).forEach(
      ([exerciseId, exercise]) => {
        addExerciseDescriptor(
          exercise,
          builtInExerciseIds.has(exerciseId) && exercise.name === exerciseId
            ? 'base'
            : 'user',
        );
      },
    );

    Object.values(state.program.savedPrograms).forEach((program) => {
      program.sessions.forEach((session) => {
        session.exercises.forEach((exercise) => {
          addBlueprintExercise(
            exercise.type === 'CardioExerciseBlueprint'
              ? CardioExerciseBlueprint.fromPOJO(exercise)
              : WeightedExerciseBlueprint.fromPOJO(exercise),
          );
        });
      });
    });

    state.sessionEditor.sessionBlueprint?.exercises.forEach((exercise) => {
      addBlueprintExercise(
        exercise.type === 'CardioExerciseBlueprint'
          ? CardioExerciseBlueprint.fromPOJO(exercise)
          : WeightedExerciseBlueprint.fromPOJO(exercise),
      );
    });

    [
      state.currentSession.workoutSession,
      state.currentSession.historySession,
      state.currentSession.feedSession,
      state.currentSession.sharedSession,
    ].forEach((session) => {
      session?.blueprint.exercises.forEach((exercise) => {
        addBlueprintExercise(
          exercise.type === 'CardioExerciseBlueprint'
            ? CardioExerciseBlueprint.fromPOJO(exercise)
            : WeightedExerciseBlueprint.fromPOJO(exercise),
        );
      });
    });

    return Array.from(allExercises.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  });
  const selectExerciseFromSearch = (ex: ExerciseDescriptor) => {
    updateExercise({ name: ex.name, notes: ex.instructions });
  };
  const { t } = useTranslate();
  const { exercise: propsExercise, updateExercise: updatePropsExercise } =
    props;
  const [exercise, setExercise] = useState(propsExercise);
  const matchingExercises = useMemo(() => {
    const searchText = exercise.name.trim();
    if (!searchText) {
      return [];
    }
    const searchRegex = new RegExp(escapeRegExp(searchText), 'i');
    const prefixRegex = new RegExp('^' + escapeRegExp(searchText), 'i');
    const exactRegex = new RegExp('^' + escapeRegExp(searchText) + '$', 'i');

    return suggestedExercises
      .filter((item) => searchRegex.test(item.name))
      .sort((a, b) => {
        const exactDiff =
          Number(exactRegex.test(b.name)) - Number(exactRegex.test(a.name));
        if (exactDiff !== 0) {
          return exactDiff;
        }
        const prefixDiff =
          Number(prefixRegex.test(b.name)) - Number(prefixRegex.test(a.name));
        if (prefixDiff !== 0) {
          return prefixDiff;
        }
        if (a.source !== b.source) {
          return a.source === 'user' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      })
      .slice(0, 8);
  }, [exercise.name, suggestedExercises]);

  // Bit of a hack to let us update exercise immediately without going through the whole props loop
  useEffect(() => {
    setExercise(propsExercise);
  }, [propsExercise]);
  const updateExercise = (
    ex: Partial<WeightedExerciseBlueprint | CardioExerciseBlueprint>,
  ) => {
    const update = exercise.with(
      ex as unknown as Partial<
        WeightedExerciseBlueprintPOJO & CardioExerciseBlueprintPOJO
      >,
    );
    setExercise(update);
    updatePropsExercise(update);
  };

  const handleTypeChange = (type: string) => {
    let newExercise = exercise;
    if (type === 'weighted') {
      newExercise = WeightedExerciseBlueprint.empty().with({
        ...exercise,
        sets: undefined!, // Will not overwrite empty
      });
    } else {
      newExercise = CardioExerciseBlueprint.empty().with({
        ...exercise,
        sets: undefined!, // Will not overwrite empty
      });
    }
    setExercise(newExercise);
    updatePropsExercise(newExercise);
  };

  const exerciseEditor = match(exercise)
    .with(P.instanceOf(WeightedExerciseBlueprint), (e) => (
      <WeightedExerciseEditor exercise={e} updateExercise={updateExercise} />
    ))
    .with(P.instanceOf(CardioExerciseBlueprint), (e) => (
      <CardioExerciseEditor exercise={e} updateExercise={updateExercise} />
    ))
    .exhaustive();

  return (
    <View style={{ gap: spacing[4] }}>
      <LabelledForm>
        <LabelledFormRow
          label={t('exercise.type.label')}
          icon={'fitnessCenterFill'}
        >
          <SegmentedButtons
            value={
              exercise instanceof WeightedExerciseBlueprint
                ? 'weighted'
                : 'cardio'
            }
            buttons={[
              {
                value: 'weighted',
                label: 'Weighted',
                icon: 'fitnessCenter',
                testID: 'weighted-button',
              },
              {
                value: 'cardio',
                label: 'Cardio/Time',
                icon: 'directionsRun',
                testID: 'cardio-button',
              },
            ]}
            onValueChange={handleTypeChange}
          />
        </LabelledFormRow>
        <LabelledFormRow label={t('exercise.name.label')} icon="infoFill">
          <View style={{ gap: spacing[2] }}>
            <TextInput
              testID="exercise-name"
              mode="outlined"
              value={exercise.name}
              onChangeText={(name) => updateExercise({ name })}
              selectTextOnFocus={true}
            />
            {!!matchingExercises.length && (
              <Card mode="contained">
                {matchingExercises.map((item, index) => (
                  <View key={`${item.source}-${item.name}`}>
                    {!!index && <Divider />}
                    <ExerciseSearchListItem
                      exercise={item}
                      onPress={selectExerciseFromSearch}
                    />
                  </View>
                ))}
              </Card>
            )}
          </View>
        </LabelledFormRow>
        {exerciseEditor}
      </LabelledForm>
    </View>
  );
}

function ExerciseSearchListItem(props: {
  exercise: ExerciseSuggestion;
  onPress: (exercise: ExerciseDescriptor) => void;
}) {
  const { t } = useTranslate();
  return (
    <List.Item
      title={props.exercise.name}
      description={
        props.exercise.source === 'user'
          ? t('exercise.source.user.label')
          : t('exercise.source.base.label')
      }
      left={(iconProps) => (
        <List.Icon
          {...iconProps}
          icon={props.exercise.source === 'user' ? 'person' : 'inventory'}
        />
      )}
      right={() => (
        <Text
          variant="labelSmall"
          style={{
            alignSelf: 'center',
            marginRight: spacing.pageHorizontalMargin,
          }}
        >
          {props.exercise.source === 'user'
            ? t('exercise.source.user.badge')
            : t('exercise.source.base.badge')}
        </Text>
      )}
      onPress={() => props.onPress(props.exercise)}
    />
  );
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function CardioExerciseEditor({
  exercise,
  updateExercise,
}: {
  exercise: CardioExerciseBlueprint;
  updateExercise: (
    ex: Partial<CardioExerciseBlueprint | WeightedExerciseBlueprint>,
  ) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <>
      <SharedFieldsEditor exercise={exercise} updateExercise={updateExercise} />
      {exercise.sets.map((set, setIndex) => (
        <CardioSetEditor
          set={set}
          key={setIndex}
          updateSet={(newSet) =>
            updateExercise({
              sets: exercise.sets.map((oldSet, i) =>
                setIndex === i ? newSet : oldSet,
              ),
            })
          }
        />
      ))}

      <List.Section>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Button
            icon={'doNotDisturbOn'}
            disabled={exercise.sets.length === 1}
            textColor={colors.error}
            onPress={() =>
              updateExercise({
                sets: exercise.sets.filter(
                  (_, i) => i !== exercise.sets.length - 1,
                ),
              })
            }
          >
            <T keyName="exercise.cardio_set.remove.button" />
          </Button>
          <Button
            icon={'addCircle'}
            onPress={() =>
              updateExercise({
                sets: [
                  ...exercise.sets,
                  exercise.sets[exercise.sets.length - 1],
                ],
              })
            }
          >
            <T keyName="exercise.cardio_set.add.button" />
          </Button>
        </View>
      </List.Section>
    </>
  );
}

function CardioSetEditor(props: {
  set: CardioExerciseSetBlueprint;
  updateSet: (val: CardioExerciseSetBlueprint) => void;
}) {
  const { t } = useTranslate();
  const { set, updateSet } = props;
  return (
    <>
      <CardioTargetEditor
        target={set.target}
        onValueChange={(target) => updateSet(set.with({ target }))}
      />
      <List.Section>
        <ListSwitch
          value={set.trackDuration || set.target.type === 'time'}
          testID="track-time-switch"
          onValueChange={(trackDuration) =>
            updateSet(set.with({ trackDuration }))
          }
          headline={t('exercise.track_time.label')}
          disabled={set.target.type === 'time'}
        />
        <ListSwitch
          value={set.trackDistance || set.target.type === 'distance'}
          testID="track-distance-switch"
          onValueChange={(trackDistance) =>
            updateSet(set.with({ trackDistance }))
          }
          headline={t('exercise.track_distance.label')}
          disabled={set.target.type === 'distance'}
        />
        <ListSwitch
          value={set.trackResistance}
          onValueChange={(trackResistance) =>
            updateSet(set.with({ trackResistance }))
          }
          headline={t('exercise.track_resistance.label')}
        />
        <ListSwitch
          value={set.trackIncline}
          onValueChange={(trackIncline) =>
            updateSet(set.with({ trackIncline }))
          }
          headline={t('exercise.track_incline.label')}
        />
        <ListSwitch
          value={set.trackWeight}
          onValueChange={(trackWeight) => updateSet(set.with({ trackWeight }))}
          headline={t('exercise.track_weight.label')}
        />
        <ListSwitch
          value={set.trackSteps}
          onValueChange={(trackSteps) => updateSet(set.with({ trackSteps }))}
          headline={t('exercise.track_steps.label')}
        />
      </List.Section>
      <Divider />
    </>
  );
}

function SharedFieldsEditor({
  exercise,
  updateExercise,
}: {
  exercise: ExerciseBlueprint;
  updateExercise: (
    ex: Partial<CardioExerciseBlueprint | WeightedExerciseBlueprint>,
  ) => void;
}) {
  const { t } = useTranslate();
  return (
    <>
      <LabelledFormRow label={t('plan.notes.label')} icon="notesFill">
        <TextInput
          mode="outlined"
          testID="exercise-notes"
          style={{ marginBottom: spacing[2] }}
          value={exercise.notes}
          onChangeText={(notes) => updateExercise({ notes })}
          multiline
        />
      </LabelledFormRow>
      <LabelledFormRow
        label={t('generic.external_link.label')}
        icon="publicFill"
      >
        <TextInput
          mode="outlined"
          testID="exercise-link"
          style={{ marginBottom: spacing[2] }}
          placeholder="https://"
          value={exercise.link}
          onChangeText={(link) => updateExercise({ link })}
        />
      </LabelledFormRow>
    </>
  );
}

function CardioTargetEditor(props: {
  target: CardioTarget;
  onValueChange: (t: CardioTarget) => void;
}) {
  const useImperialUnits = useAppSelector((x) => x.settings.useImperialUnits);
  const { target, onValueChange } = props;
  const { t } = useTranslate();
  const handleTypeChange = (type: CardioTarget['type']) => {
    if (type === target.type) {
      return;
    }
    switch (type) {
      case 'distance':
        onValueChange({
          type: 'distance',
          value: {
            unit: useImperialUnits ? 'mile' : 'metre',
            value: BigNumber(useImperialUnits ? 2.5 : 5000),
          },
        });
        return;
      case 'time':
        onValueChange({
          type: 'time',
          value: Duration.ofMinutes(30),
        });
        return;

      default:
        assertUnreachable(type);
    }
  };
  return (
    <>
      <LabelledFormRow
        label={t('exercise.cardio_target.label')}
        icon={'targetFill'}
      >
        <SegmentedButtons
          value={target.type}
          onValueChange={handleTypeChange}
          buttons={[
            {
              value: 'distance',
              label: t('exercise.distance.label'),
              icon: 'trailLength',
              testID: 'distance-button',
            },
            {
              value: 'time',
              label: t('generic.time.label'),
              icon: 'timer',
              testID: 'time-button',
            },
          ]}
        />
      </LabelledFormRow>

      {matchCardioTarget(target, {
        distance: (t) => (
          <DistanceTargetEditor target={t} onValueChange={onValueChange} />
        ),
        time: (t) => (
          <TimeTargetEditor target={t} onValueChange={onValueChange} />
        ),
      })}
    </>
  );
}

function DistanceTargetEditor(props: {
  target: DistanceCardioTarget;
  onValueChange: (t: DistanceCardioTarget) => void;
}) {
  const { target, onValueChange } = props;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1 }}>
        <EditableIncrementer
          onChange={(value) =>
            onValueChange({ ...target, value: { ...target.value, value } })
          }
          disallowNegative
          value={props.target.value.value}
        />
      </View>

      <SelectButton
        testID="setDistanceUnit"
        value={target.value.unit}
        options={distanceUnitOptions}
        onChange={(unit) =>
          onValueChange({ ...target, value: { ...target.value, unit } })
        }
      />
    </View>
  );
}

function TimeTargetEditor(props: {
  target: TimeCardioTarget;
  onValueChange: (t: TimeCardioTarget) => void;
}) {
  return (
    <DurationEditor
      duration={props.target.value}
      showHours
      onDurationUpdated={(value) =>
        props.onValueChange({ type: 'time', value })
      }
    />
  );
}

function WeightedExerciseEditor({
  exercise,
  updateExercise,
}: {
  exercise: WeightedExerciseBlueprint;
  updateExercise: (ex: Partial<ExerciseBlueprint>) => void;
}) {
  const { t } = useTranslate();

  const setSets = (value: number) =>
    updateExercise({ sets: Math.max(value, 1) });

  const setReps = (value: number) =>
    updateExercise({ repsPerSet: Math.max(value, 1) });

  const setExerciseWeightIncrease = (weightIncreaseOnSuccess: BigNumber) =>
    updateExercise({ weightIncreaseOnSuccess });

  return (
    <View style={{ gap: spacing[2] }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          gap: spacing[4],
          marginBlockEnd: spacing[2],
        }}
      >
        <Card style={{ flex: 1 }} mode="contained">
          <Card.Content>
            <FixedIncrementer
              label={t('exercise.sets.label')}
              onValueChange={setSets}
              value={exercise.sets}
              testID="exercise-sets"
            />
          </Card.Content>
        </Card>
        <Card style={{ flex: 1 }} mode="contained">
          <Card.Content>
            <FixedIncrementer
              label={t('exercise.reps.label')}
              onValueChange={setReps}
              value={exercise.repsPerSet}
              testID="exercise-reps"
            />
          </Card.Content>
        </Card>
      </View>

      <SharedFieldsEditor exercise={exercise} updateExercise={updateExercise} />

      <LabelledFormRow
        label={t('exercise.progressive_overload.label')}
        icon="speedFill"
      >
        <EditableIncrementer
          testID="exercise-auto-increase"
          value={exercise.weightIncreaseOnSuccess}
          onChange={setExerciseWeightIncrease}
        />
      </LabelledFormRow>

      <RestEditorGroup
        rest={exercise.restBetweenSets}
        onRestUpdated={(restBetweenSets) => updateExercise({ restBetweenSets })}
      />

      <ListSwitch
        headline={t('workout.superset_next_exercise.button')}
        value={exercise.supersetWithNext}
        supportingText=""
        testID="exercise-superset"
        onValueChange={(supersetWithNext) =>
          updateExercise({ supersetWithNext })
        }
      />
    </View>
  );
}
