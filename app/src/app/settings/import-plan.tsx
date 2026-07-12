import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import AssignmentAddIcon from '@expo/material-symbols/assignment_add.xml';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import SessionSummary from '@/components/presentation/summary/session-summary';
import SessionSummaryTitle from '@/components/presentation/summary/session-summary-title';
import { spacing } from '@/hooks/useAppTheme';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
import { Session } from '@/models/session-models';
import { useAppSelector } from '@/store';
import { clearPendingImport, savePlan, selectPendingImport } from '@/store/program';
import { uuid } from '@/utils/uuid';
import { useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { Fragment, useEffect } from 'react';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';

export default function ImportPlan() {
  const pending = useAppSelector(selectPendingImport);
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const { replace } = useRouter();
  const preferredWeightUnit = usePreferredWeightUnit();

  // Leaving the screen without saving (system back or after save) discards the
  // pending plan so the import gate doesn't route us straight back here.
  useEffect(() => () => void dispatch(clearPendingImport()), [dispatch]);

  const save = () => {
    if (!pending) {
      return;
    }
    const programId = uuid();
    dispatch(savePlan({ programId, programBlueprint: pending }));
    replace(`/settings/program-list?focusprogramId=${programId}`);
  };

  return (
    <FullHeightScrollView
      floatingChildren={
        pending ? (
          <PageActions
            primaryKind="commit"
            primary={{
              label: t('plan.import.save.button'),
              icon: AssignmentAddIcon,
              systemImage: 'plus',
              onPress: save,
            }}
          />
        ) : undefined
      }
    >
      <Stack.Screen options={{ title: t('plan.import.title') }} />
      {pending && (
        <View style={{ gap: spacing[2], padding: spacing.pageHorizontalMargin }}>
          <SurfaceText font="text-2xl" weight="bold">
            {pending.name}
          </SurfaceText>
          {pending.sessions.map((session, i) => (
            <Fragment key={i}>
              <SessionSummaryTitle session={Session.getEmptySession(session, preferredWeightUnit)} />
              <SessionSummary session={Session.getEmptySession(session, preferredWeightUnit)} />
            </Fragment>
          ))}
        </View>
      )}
    </FullHeightScrollView>
  );
}
