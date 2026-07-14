import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { spacing } from '@/hooks/useAppTheme';
import { useAppSelectorWithArg } from '@/store';
import { selectCurrentSession, SessionTarget, setCurrentSession } from '@/store/current-session';
import { useTranslate } from '@tolgee/react';
import { Href, Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useDispatch, useStore } from 'react-redux';

export function getSessionWorkoutEditorHref(target: SessionTarget): Href {
  return `/workout-editor?target=${target}` as Href;
}

export function SessionWorkoutEditor(props: { target: SessionTarget }) {
  const { t } = useTranslate();
  const workout = useAppSelectorWithArg(selectCurrentSession, props.target);
  const dispatch = useDispatch();
  const { getState } = useStore();
  const { dismiss } = useRouter();

  const title = t('workout.edit.button');

  // Hold edits locally and only apply them to the session when the route is dismissed
  const [name, setName] = useState(workout?.blueprint.name ?? '');
  const draftRef = useRef<{ name?: string; notes?: string }>({});
  const updateBlueprint = (changes: { name?: string; notes?: string }) => {
    if (changes.name !== undefined) {
      setName(changes.name);
    }
    draftRef.current = { ...draftRef.current, ...changes };
  };

  const commitRef = useRef(() => {});
  commitRef.current = () => {
    const changes = draftRef.current;
    if (changes.name === undefined && changes.notes === undefined) {
      return;
    }
    const latestSession = selectCurrentSession(getState(), props.target);
    if (latestSession) {
      dispatch(
        setCurrentSession({
          session: latestSession.with({ blueprint: latestSession.blueprint.with(changes) }),
          target: props.target,
        }),
      );
    }
  };
  useEffect(() => () => commitRef.current(), []);

  const hasWorkout = !!workout;
  useEffect(() => {
    if (!hasWorkout) {
      dismiss();
    }
  }, [hasWorkout, dismiss]);

  return (
    <FullHeightScrollView avoidKeyboard scrollStyle={{ padding: spacing.pageHorizontalMargin }}>
      <Stack.Screen options={{ title }} />
      {workout ? (
        <View style={{ gap: spacing[2] }}>
          <TextInput
            label={t('workout.name.label')}
            testID="workout-name"
            style={{ marginBottom: spacing[2] }}
            value={name}
            onChangeText={(name) => updateBlueprint({ name })}
          />
          <TextInput
            label={t('plan.notes.label')}
            testID="workout-notes"
            style={{ marginBottom: spacing[2] }}
            defaultValue={workout.blueprint.notes}
            onChangeText={(notes) => updateBlueprint({ notes })}
            multiline
          />
        </View>
      ) : null}
    </FullHeightScrollView>
  );
}
