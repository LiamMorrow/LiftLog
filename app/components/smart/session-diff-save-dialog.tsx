import FullScreenDialog from '@/components/presentation/full-screen-dialog';
import LimitedHtml from '@/components/presentation/limited-html';
import SessionDiffView from '@/components/presentation/session-diff-view';
import { spacing } from '@/hooks/useAppTheme';
import { EmptySessionBlueprintDiff } from '@/models/blueprint-diff';
import { useAppSelector } from '@/store';
import { setCurrentPlanDiff } from '@/store/current-session';
import { applyDiffToPlan, fetchUpcomingSessions } from '@/store/program';
import { useTranslate } from '@tolgee/react';
import { Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export function SessionDiffSaveDialog() {
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const currentPlanDiff = useAppSelector(
    (x) => x.currentSession.currentPlanDiff,
  );
  return (
    <FullScreenDialog
      open={!!currentPlanDiff}
      onClose={() => {
        dispatch(setCurrentPlanDiff(undefined));
      }}
      title={t('plan.diff.dialog.title')}
      action={t('generic.save.button')}
      onAction={() => {
        if (currentPlanDiff) {
          dispatch(applyDiffToPlan(currentPlanDiff));
        }
        dispatch(setCurrentPlanDiff(undefined));
        dispatch(fetchUpcomingSessions());
      }}
    >
      <Text
        style={{
          paddingBlockEnd: spacing[2],
        }}
        variant="bodyMedium"
      >
        {currentPlanDiff?.type === 'diff' ? (
          <LimitedHtml
            value={t('plan.diff.dialog_update.body', {
              originalSessionName: currentPlanDiff?.originalSession.name,
            })}
          />
        ) : (
          t('plan.diff.dialog_add.body')
        )}
      </Text>
      <SessionDiffView
        diff={currentPlanDiff?.diff ?? EmptySessionBlueprintDiff}
        onSelectedDiffChange={() => {}}
      />
    </FullScreenDialog>
  );
}
