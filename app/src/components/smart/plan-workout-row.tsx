import IconButton from '@/components/presentation/foundation/icon-button';
import Menu from '@/components/presentation/foundation/menu';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import CopyWorkoutDialog from '@/components/smart/copy-workout-dialog';
import { rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { SessionBlueprint } from '@/models/blueprint-models';
import { useAppSelectorWithArg } from '@/store';
import { showSnackbar } from '@/store/app';
import {
  addProgramSession,
  moveSessionBlueprintDownInProgram,
  moveSessionBlueprintUpInProgram,
  removeSessionFromProgram,
  selectProgram,
  setProgramSessions,
} from '@/store/program';
import ContentCopy from '@expo/material-symbols/content_copy.xml';
import CopyAll from '@expo/material-symbols/copy_all.xml';
import Delete from '@expo/material-symbols/delete.xml';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';

interface PlanWorkoutRowProps {
  programId: string;
  sessionBlueprint: SessionBlueprint;
  sessionIndex: number;
  reordering: boolean;
  onPress: () => void;
}

export function PlanWorkoutRow({
  programId,
  sessionBlueprint,
  sessionIndex,
  reordering,
  onPress,
}: PlanWorkoutRowProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const plan = useAppSelectorWithArg(selectProgram, programId);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);

  const exerciseCount = sessionBlueprint.exercises.length;
  const summary = [
    t(exerciseCount === 1 ? 'plan.summary.exercise' : 'plan.summary.exercises', { count: exerciseCount }),
    sessionBlueprint.exercises.map((exercise) => exercise.name).join(', '),
  ]
    .filter(Boolean)
    .join(' · ');

  const restoreSessions = (text: string) =>
    showSnackbar({
      text,
      action: t('generic.undo.button'),
      dispatchAction: setProgramSessions({ programId, sessionBlueprints: plan.sessions }),
    });

  const removeSession = () => {
    dispatch(restoreSessions(t('workout.removed.message')));
    dispatch(removeSessionFromProgram({ programId, sessionBlueprint }));
  };

  const duplicateSession = () => {
    dispatch(restoreSessions(t('workout.duplicated.message')));
    dispatch(
      addProgramSession({
        programId,
        sessionBlueprint: sessionBlueprint.with({
          name: `${t('workout.workout.label')} ${plan.sessions.length + 1}`,
        }),
      }),
    );
  };

  return (
    <>
      <TouchableRipple testID="plan-workout-row" onPress={reordering ? undefined : onPress}>
        <View
          style={{
            minHeight: spacing[20] - spacing[2],
            paddingVertical: spacing[2],
            paddingLeft: spacing[4],
            paddingRight: spacing[1],
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[4],
          }}
        >
          <View
            style={{
              width: spacing[10],
              height: spacing[10],
              borderRadius: rounding.roundedRectangleRadius,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text variant="titleMedium">{sessionIndex + 1}</Text>
          </View>
          <View style={{ flex: 1, gap: spacing[0.5] }}>
            <Text variant="titleMedium">{sessionBlueprint.name}</Text>
            <Text variant="bodyMedium" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>
              {summary}
            </Text>
          </View>
          {reordering ? (
            <View style={{ flexDirection: 'row' }}>
              <IconButton
                icon="arrowUpward"
                disabled={sessionIndex === 0}
                accessibilityLabel={t('generic.move_up.button')}
                onPress={() => dispatch(moveSessionBlueprintUpInProgram({ programId, sessionBlueprint }))}
              />
              <IconButton
                icon="arrowDownward"
                disabled={sessionIndex === plan.sessions.length - 1}
                accessibilityLabel={t('generic.move_down.button')}
                onPress={() => dispatch(moveSessionBlueprintDownInProgram({ programId, sessionBlueprint }))}
              />
            </View>
          ) : (
            <Menu
              trigger={(open) => (
                <IconButton icon="moreHoriz" accessibilityLabel={t('generic.more_options.button')} onPress={open} />
              )}
              items={[
                {
                  label: t('generic.duplicate.button'),
                  icon: ContentCopy,
                  systemImage: 'doc.on.doc',
                  onPress: duplicateSession,
                },
                {
                  label: t('exercise.copy_to.button'),
                  icon: CopyAll,
                  systemImage: 'doc.on.clipboard',
                  onPress: () => setCopyDialogOpen(true),
                },
                {
                  label: t('generic.remove.button'),
                  icon: Delete,
                  systemImage: 'trash',
                  onPress: removeSession,
                },
              ]}
            />
          )}
        </View>
      </TouchableRipple>
      <CopyWorkoutDialog
        visible={copyDialogOpen}
        onDismiss={() => setCopyDialogOpen(false)}
        sessionBlueprint={sessionBlueprint}
        currentProgramId={programId}
      />
    </>
  );
}
