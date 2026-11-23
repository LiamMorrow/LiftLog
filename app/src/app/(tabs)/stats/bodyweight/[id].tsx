import { useServices } from '@/components/app-shell/services-provider';
import { Card, CardContent } from '@/components/foundation/card';
import { DatePicker } from '@/components/foundation/date-picker';
import { WeightEditor } from '@/components/foundation/editors/weight-editor';
import { PageActions } from '@/components/foundation/page-actions';
import { SegmentedGroup, SegmentListFormElement } from '@/components/foundation/segmented-list';
import { SettingsPage } from '@/components/layout/settings-page';
import { readBodyweightEntries } from '@/db/bodyweight-entries';
import { useConfirm } from '@/hooks/useConfirm';
import { useAppTheme } from '@/hooks/useAppTheme';
import { putBodyweightEntries, removeBodyweightEntry } from '@/store/stats';
import CalendarMonthIcon from '@expo/material-symbols/calendar_month.xml';
import CheckIcon from '@expo/material-symbols/check.xml';
import DeleteIcon from '@expo/material-symbols/delete.xml';
import { LocalDate } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

export default function BodyweightEntryPage() {
  const { t } = useTranslate();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { db } = useServices();
  const { colors } = useAppTheme();
  const dispatch = useDispatch();
  const router = useRouter();
  const confirm = useConfirm();
  const [{ existing, latest }] = useState(() => {
    const entries = readBodyweightEntries(db);
    return { existing: entries.find((x) => x.id === id), latest: entries.at(0) };
  });
  const [date, setDate] = useState(existing?.date ?? LocalDate.now());
  const [weight, setWeight] = useState(existing?.weight ?? latest?.weight);

  const save = () => {
    dispatch(putBodyweightEntries([{ id, date, weight: weight! }]));
    router.back();
  };
  const remove = () =>
    confirm({
      title: t('stats.bodyweight.delete.title'),
      message: t('stats.bodyweight.delete.message'),
      destructive: true,
      onOk: () => {
        dispatch(removeBodyweightEntry(id));
        router.back();
      },
    });

  return (
    <SettingsPage
      title={t('exercise.bodyweight.label')}
      actions={
        <PageActions
          primaryKind="commit"
          primary={{
            label: t('generic.save.button'),
            onPress: save,
            disabled: !weight?.value.isGreaterThan(0),
            icon: CheckIcon,
            systemImage: 'checkmark',
          }}
          secondary={
            existing && [{ label: t('generic.delete.button'), onPress: remove, icon: DeleteIcon, systemImage: 'trash' }]
          }
        />
      }
    >
      <SegmentedGroup>
        <SegmentListFormElement
          icon={CalendarMonthIcon}
          systemImage="calendar"
          label={t('generic.date.label')}
          right={<DatePicker value={date} onChange={setDate} />}
        />
      </SegmentedGroup>
      <Card style={{ backgroundColor: colors.surfaceContainer }}>
        <CardContent>
          <WeightEditor allowNull weight={weight} updateWeight={setWeight} increment={new BigNumber('0.1')} />
        </CardContent>
      </Card>
    </SettingsPage>
  );
}
