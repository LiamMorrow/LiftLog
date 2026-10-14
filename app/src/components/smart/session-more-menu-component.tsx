import { Session } from '@/models/session-models';
import { useTranslate } from '@tolgee/react';
import { getSessionWorkoutEditorHref } from '@/components/smart/session-workout-editor';
import PageMenu from '@/components/presentation/foundation/page-menu';
import { Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MenuItem } from '@/components/presentation/foundation/menu';
import Button from '@/components/presentation/foundation/button';
import Edit from '@expo/material-symbols/edit.xml';

export default function SessionMoreMenuComponent(props: {
  session: Session;
  isActiveWorkout?: boolean;
  save: () => void;
  /** Actions the screen adds below the ones every session has. */
  additionalItems?: MenuItem[];
}) {
  const { save, session, isActiveWorkout, additionalItems } = props;
  const { push } = useRouter();
  const { t } = useTranslate();

  const finishText = isActiveWorkout ? t('generic.finish.button') : t('generic.save.button');

  const handleEditWorkout = () => push(getSessionWorkoutEditorHref(session.id));

  return (
    <PageMenu
      testID="session-more"
      actions={Platform.select({
        // The toolbar reads its children natively, so this has to stay a literal toolbar button
        // rather than a component that renders one.
        ios: (
          <Stack.Toolbar.Button onPress={save}>
            <Stack.Toolbar.Label>{finishText}</Stack.Toolbar.Label>
          </Stack.Toolbar.Button>
        ),
        android: (
          <Stack.Toolbar.View>
            <Button mode="text" compact onPress={save}>
              {finishText}
            </Button>
          </Stack.Toolbar.View>
        ),
      })}
      items={[
        {
          label: t('workout.edit.button'),
          icon: Edit,
          systemImage: 'pencil',
          onPress: handleEditWorkout,
        },
        ...(additionalItems ?? []),
      ]}
    />
  );
}
