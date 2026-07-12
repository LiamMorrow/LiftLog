import { selectCurrentSession, SessionTarget } from '@/store/current-session';
import { useTranslate } from '@tolgee/react';
import { useEffect, useRef, useState } from 'react';
import { getSessionWorkoutEditorHref } from '@/components/smart/session-workout-editor';
import { useAppSelectorWithArg } from '@/store';
import { Tooltip, TooltipHandle } from 'react-native-paper';
import PageMenu from '@/components/presentation/foundation/page-menu';
import { Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Jiggler } from '@/components/presentation/foundation/jiggler';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';

export default function SessionMoreMenuComponent(props: { target: SessionTarget; save: () => void }) {
  const { save, target } = props;
  const session = useAppSelectorWithArg(selectCurrentSession, target);
  const { push } = useRouter();
  const { t } = useTranslate();

  const isReadonly = target === 'feedSession';

  const handleEditWorkout = () => {
    push(getSessionWorkoutEditorHref(target));
  };

  const finishText = target === 'workoutSession' ? t('generic.finish.button') : t('generic.save.button');

  if (!session || isReadonly) {
    return <></>;
  }

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
        android: <AndroidFinishButton target={target} save={save} />,
      })}
      items={[
        {
          label: t('workout.edit.button'),
          icon: 'edit',
          systemImage: 'pencil',
          onPress: handleEditWorkout,
        },
      ]}
    />
  );
}

function AndroidFinishButton({ target, save }: { target: SessionTarget; save: () => void }) {
  const { t } = useTranslate();
  const session = useAppSelectorWithArg(selectCurrentSession, target);

  const [jiggleFinishButton, setJiggleFinishButton] = useState(false);
  const isComplete = session?.isComplete;
  const hasExercises = !!session?.recordedExercises.length;
  const tooltipRef = useRef<TooltipHandle>(null);

  useEffect(() => {
    const shouldJiggle = hasExercises && isComplete === true;
    setJiggleFinishButton(shouldJiggle);
    if (shouldJiggle) {
      tooltipRef.current?.show();
      const timeout = setTimeout(() => {
        setJiggleFinishButton(false);
        tooltipRef.current?.hide();
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [isComplete, hasExercises]);

  return (
    <Jiggler jiggling={jiggleFinishButton} jiggleSpeed={140}>
      <Tooltip ref={tooltipRef} title={t('workout.finish.action.tooltip')}>
        <IconButton testID="finish-session-button" icon={'assignmentTurnedIn'} onPress={save} />
      </Tooltip>
    </Jiggler>
  );
}
