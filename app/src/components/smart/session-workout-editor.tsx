import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { spacing } from '@/hooks/useAppTheme';
import { useAppSelectorWithArg } from '@/store';
import { selectSession, updateStoredSession } from '@/store/stored-sessions';
import { useTranslate } from '@tolgee/react';
import { Href, Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListTextInput } from '@/components/presentation/foundation/segmented-list-text-input';
import { useDispatch } from 'react-redux';
import { useOnDismiss } from '@/hooks/useOnDismiss';

export function getSessionWorkoutEditorHref(sessionId: string): Href {
  return `/workout-editor?sessionId=${encodeURIComponent(sessionId)}`;
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
    <FullHeightScrollView avoidKeyboard modal scrollStyle={{ padding: spacing.pageHorizontalMargin }}>
      <Stack.Screen options={{ title }} />
      {workout ? (
        <SegmentedGroup>
          <SegmentedListTextInput
            label={t('workout.name.label')}
            testID="workout-name"
            value={name}
            onChangeText={(name) => updateBlueprint({ name })}
          />
          <SegmentedListTextInput
            label={t('plan.notes.label')}
            testID="workout-notes"
            defaultValue={workout.blueprint.notes}
            onChangeText={(notes) => updateBlueprint({ notes })}
            multiline
          />
        </SegmentedGroup>
      ) : null}
    </FullHeightScrollView>
  );
}
