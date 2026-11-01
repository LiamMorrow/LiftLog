import { NativeIconButton } from '@/components/presentation/foundation/native-icon-button';
import ArrowUpwardIcon from '@expo/material-symbols/arrow_upward.xml';
import ArrowDownwardIcon from '@expo/material-symbols/arrow_downward.xml';
import MoreHorizIcon from '@expo/material-symbols/more_horiz.xml';
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
import { AppText } from '@/components/presentation/foundation/app-text';
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
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: spacing[1] }}>
        <TouchableRipple
          testID="plan-workout-row"
          onPress={reordering ? undefined : onPress}
          style={{ flex: 1, alignSelf: 'stretch' }}
        >
          <View
            style={{
              flex: 1,
              minHeight: spacing[20] - spacing[2],
              paddingVertical: spacing[2],
              paddingLeft: spacing[4],
              paddingRight: spacing[3],
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
              <AppText variant="titleMedium">{sessionIndex + 1}</AppText>
            </View>
            <View style={{ flex: 1, gap: spacing[0.5] }}>
              <AppText variant="titleMedium">{sessionBlueprint.name}</AppText>
              <AppText variant="bodyMedium" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>
                {summary}
              </AppText>
            </View>
          </View>
        </TouchableRipple>
        {reordering ? (
          <View style={{ flexDirection: 'row' }}>
            <NativeIconButton
              icon={ArrowUpwardIcon}
              systemImage="arrow.up"
              disabled={sessionIndex === 0}
              label={t('generic.move_up.button')}
              onPress={() => dispatch(moveSessionBlueprintUpInProgram({ programId, sessionBlueprint }))}
            />
            <NativeIconButton
              icon={ArrowDownwardIcon}
              systemImage="arrow.down"
              disabled={sessionIndex === plan.sessions.length - 1}
              label={t('generic.move_down.button')}
              onPress={() => dispatch(moveSessionBlueprintDownInProgram({ programId, sessionBlueprint }))}
            />
          </View>
        ) : (
          <Menu
            trigger={{
              icon: MoreHorizIcon,
              systemImage: 'ellipsis',
              label: t('generic.more_options.button'),
            }}
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
      <CopyWorkoutDialog
        visible={copyDialogOpen}
        onDismiss={() => setCopyDialogOpen(false)}
        sessionBlueprint={sessionBlueprint}
        currentProgramId={programId}
      />
    </>
  );
}
