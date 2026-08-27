import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { spacing } from '@/hooks/useAppTheme';
import { useAppSelectorWithArg } from '@/store';
import { selectSession, updateStoredSession } from '@/store/stored-sessions';
import { useTranslate } from '@tolgee/react';
import { Href, Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useOnDismiss } from '@/hooks/useOnDismiss';

export function getSessionWorkoutEditorHref(sessionId: string): Href {
  return `/workout-editor?sessionId=${encodeURIComponent(sessionId)}` as Href;
}

export function SessionWorkoutEditor(props: { sessionId: string }) {
  const { t } = useTranslate();
  const workout = useAppSelectorWithArg(selectSession, props.sessionId);
  const dispatch = useDispatch();
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

  useOnDismiss(() => {
    const changes = draftRef.current;
    if (changes.name === undefined && changes.notes === undefined) {
      return;
    }
    dispatch(
      updateStoredSession({
        sessionId: props.sessionId,
        update: (s) => s.with({ blueprint: s.blueprint.with(changes) }),
      }),
    );
  });

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
