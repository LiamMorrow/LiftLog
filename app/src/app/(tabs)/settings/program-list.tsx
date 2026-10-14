import { SettingsPage } from '@/components/layout/settings-page';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import ProgramListItem from '@/components/smart/program-list-item';
import { ActivePlanCard } from '@/components/smart/active-plan-card';
import { ProgramBlueprint } from '@/models/blueprint-models';
import { useAppSelector } from '@/store';
import { savePlan, selectAllPrograms } from '@/store/program';
import { uuid } from '@/utils/uuid';
import { LocalDate } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import AddIcon from '@expo/material-symbols/add.xml';
import DownloadIcon from '@expo/material-symbols/download.xml';

import { useDispatch } from 'react-redux';
import { useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { showSnackbar } from '@/store/app';
import { setActivePlan } from '@/store/program';
import { setPlansSortOrder } from '@/store/settings';
import SelectPicker from '@/components/presentation/foundation/select-picker';
import { View } from 'react-native';

export default function ProgramListPage() {
  const ps = useAppSelector(selectAllPrograms);
  const activePlanId = useAppSelector((state) => state.program.activePlanId);
  const sortOrder = useAppSelector((state) => state.settings.plansSortOrder);
  const scrollRef = useRef<ScrollView>(null);

  const selectPlan = (planId: string, name: string) => {
    const previousPlanId = activePlanId;
    dispatch(setActivePlan({ activePlanId: planId }));
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    dispatch(
      showSnackbar(
        previousPlanId
          ? {
              text: t('plan.now_using.message', { name }),
              action: t('generic.undo.button'),
              dispatchAction: setActivePlan({ activePlanId: previousPlanId }),
            }
          : { text: t('plan.now_using.message', { name }) },
      ),
    );
  };
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { focusprogramId } = useLocalSearchParams<{
    focusprogramId?: string;
  }>();
  const { push } = useRouter();
  const addProgram = () => {
    const programId = uuid();
    dispatch(
      savePlan({
        programId,
        programBlueprint: new ProgramBlueprint(t('plan.new_default_name.label'), [], LocalDate.now()),
      }),
    );
    push(`/settings/manage-workouts/${programId}/`);
  };
  const otherPlans = ps.filter(({ id }) => id !== activePlanId);
  if (sortOrder === 'recent') {
    otherPlans.sort((a, b) => b.program.lastEdited.compareTo(a.program.lastEdited));
  }

  const footer = (
    <PageActions
      primary={{
        label: t('plan.add.button'),
        icon: AddIcon,
        systemImage: 'plus',
        onPress: addProgram,
      }}
      secondary={[
        {
          label: t('plan.import.button'),
          icon: DownloadIcon,
          systemImage: 'square.and.arrow.down',
          onPress: () => push('/settings/import-plan-info'),
        },
      ]}
    />
  );
  return (
    <SettingsPage
      title={t('plan.plans.title')}
      caption={t('plan.manage.subtitle')}
      actions={footer}
      scrollRef={scrollRef}
    >
      {activePlanId ? <ActivePlanCard id={activePlanId} /> : undefined}

      {otherPlans.length > 1 ? (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <SelectPicker
            value={sortOrder}
            options={[
              { value: 'name', label: t('plan.sort.name') },
              { value: 'recent', label: t('plan.sort.recent') },
            ]}
            onChange={(value) => dispatch(setPlansSortOrder(value))}
          />
        </View>
      ) : undefined}

      <SegmentedGroup>
        {otherPlans.map(({ id, program }) => (
          <ProgramListItem
            key={id}
            id={id}
            isFocused={focusprogramId === id}
            onSelect={() => selectPlan(id, program.name)}
          />
        ))}
      </SegmentedGroup>
    </SettingsPage>
  );
}
