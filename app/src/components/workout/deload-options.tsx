import { PageActions } from '@/components/foundation/page-actions';
import { SegmentedGroup } from '@/components/foundation/segmented-list';
import { SegmentedListSelect } from '@/components/foundation/segmented-list-select';
import { SettingsPage } from '@/components/layout/settings-page';
import { deloadSession, DeloadStyle } from '@/models/deload';
import { useAppSelector } from '@/store';
import { setDeloadSetsPercent, setDeloadStyle, setDeloadWeightPercent } from '@/store/settings';
import { updateStoredSession } from '@/store/stored-sessions';
import ArrowDownwardIcon from '@expo/material-symbols/arrow_downward.xml';
import { useTranslate } from '@tolgee/react';
import { Href, useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';

const deloadPercents = [40, 50, 60, 70, 80];

export function getDeloadOptionsHref(sessionId: string): Href {
  return `/deload-options?sessionId=${encodeURIComponent(sessionId)}`;
}

export function DeloadOptions({ sessionId }: { sessionId: string }) {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { dismiss } = useRouter();
  const style = useAppSelector((x) => x.settings.deloadStyle);
  const weightPercent = useAppSelector((x) => x.settings.deloadWeightPercent);
  const setsPercent = useAppSelector((x) => x.settings.deloadSetsPercent);
  const percentOptions = deloadPercents.map((percent) => ({
    value: percent,
    label: t('workout.deload.percent_of_normal.label', { percent }),
  }));

  const applyDeload = () => {
    dispatch(
      updateStoredSession({
        sessionId,
        update: (session) => deloadSession(session, { style, weightPercent, setsPercent }),
      }),
    );
    dismiss();
  };

  return (
    <SettingsPage
      modal
      title={t('workout.deload.title')}
      caption={t('workout.deload.explanation.body')}
      actions={
        <PageActions
          primaryKind="commit"
          primary={{
            label: t('workout.deload.button'),
            icon: ArrowDownwardIcon,
            systemImage: 'arrow.down',
            onPress: applyDeload,
          }}
        />
      }
    >
      <SegmentedGroup>
        <SegmentedListSelect<DeloadStyle>
          testID="deload-style"
          label={t('workout.deload.style.label')}
          value={style}
          options={[
            { value: 'lighterWeight', label: t('workout.deload.style.lighter_weight') },
            { value: 'fewerSets', label: t('workout.deload.style.fewer_sets') },
            { value: 'unchanged', label: t('workout.deload.style.unchanged') },
          ]}
          onChange={(value) => dispatch(setDeloadStyle(value))}
        />
        {style === 'lighterWeight' ? (
          <SegmentedListSelect<number>
            testID="deload-weight"
            label={t('workout.deload.weight.label')}
            value={weightPercent}
            options={percentOptions}
            onChange={(value) => dispatch(setDeloadWeightPercent(value))}
          />
        ) : undefined}
        {style === 'fewerSets' ? (
          <SegmentedListSelect<number>
            testID="deload-sets"
            label={t('workout.deload.sets.label')}
            value={setsPercent}
            options={percentOptions}
            onChange={(value) => dispatch(setDeloadSetsPercent(value))}
          />
        ) : undefined}
      </SegmentedGroup>
    </SettingsPage>
  );
}
