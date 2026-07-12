import { selectCurrentSession, SessionTarget } from '@/store/current-session';
import { useTranslate } from '@tolgee/react';
import { useEffect, useRef, useState } from 'react';
import { getSessionWorkoutEditorHref } from '@/components/smart/session-workout-editor';
import { useAppSelectorWithArg } from '@/store';
import { Appbar, Tooltip, TooltipHandle } from 'react-native-paper';
import Menu from '@/components/presentation/foundation/menu';
import { Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Jiggler } from '@/components/presentation/foundation/jiggler';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';

export default function SessionMoreMenuComponent(props: { target: SessionTarget; save: () => void }) {
  const { save } = props;
  const session = useAppSelectorWithArg(selectCurrentSession, props.target);
  const { push } = useRouter();

  const isReadonly = props.target === 'feedSession';

  const handleEditWorkout = () => {
    push(getSessionWorkoutEditorHref(props.target));
  };

  if (!session || isReadonly) {
    return <></>;
  }

  return (
    <>
      {Platform.select({
        ios: <IosMenu target={props.target} save={save} onEditWorkout={handleEditWorkout} />,
        android: (
          <Stack.Screen
            options={{
              headerRight: () => <AndroidMenu target={props.target} save={save} onEditWorkout={handleEditWorkout} />,
            }}
          />
        ),
      })}
    </>
  );
}

function IosMenu(props: { target: SessionTarget; save: () => void; onEditWorkout: () => void }) {
  const { t } = useTranslate();
  const { target, save, onEditWorkout } = props;
  const finishText = target === 'workoutSession' ? t('generic.finish.button') : t('generic.save.button');
  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Button onPress={save}>
        <Stack.Toolbar.Label>{finishText}</Stack.Toolbar.Label>
      </Stack.Toolbar.Button>
      <Stack.Toolbar.Menu>
        <Stack.Toolbar.Icon sf="ellipsis.circle" />
        <Stack.Toolbar.MenuAction onPress={onEditWorkout} icon={'pencil'}>
          {t('workout.edit.button')}
        </Stack.Toolbar.MenuAction>
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}

function AndroidMenu(props: { target: SessionTarget; save: () => void; onEditWorkout: () => void }) {
  const { t } = useTranslate();
  const { target, save, onEditWorkout } = props;
  const session = useAppSelectorWithArg(selectCurrentSession, target);

  const [jiggleFinishButton, setJiggleFinishButton] = useState(false);
  const isComplete = session?.isComplete;
  const tooltipRef = useRef<TooltipHandle>(null);

  useEffect(() => {
    const shouldJiggle = isComplete === true;
    setJiggleFinishButton(shouldJiggle);
    if (shouldJiggle) {
      tooltipRef.current?.show();
      const timeout = setTimeout(() => {
        setJiggleFinishButton(false);
        tooltipRef.current?.hide();
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [isComplete]);
  return (
    <>
      <Jiggler jiggling={jiggleFinishButton} jiggleSpeed={140}>
        <Tooltip ref={tooltipRef} title={t('workout.finish.action.tooltip')}>
          <IconButton testID="finish-session-button" icon={'assignmentTurnedIn'} onPress={save} />
        </Tooltip>
      </Jiggler>
      <Menu
        trigger={(open) => <Appbar.Action testID="session-more" icon="moreVert" onPress={open} />}
        items={[
          {
            label: t('workout.edit.button'),
            icon: 'edit',
            onPress: onEditWorkout,
          },
        ]}
      />
    </>
  );
}
