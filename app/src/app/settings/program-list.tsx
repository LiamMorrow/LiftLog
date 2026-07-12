import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import ProgramListItem from '@/components/smart/program-list-item';
import { ProgramBlueprint } from '@/models/blueprint-models';
import { spacing } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { importPlanFromPicker, savePlan, selectAllPrograms } from '@/store/program';
import { uuid } from '@/utils/uuid';
import { LocalDate } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import AddIcon from '@expo/material-symbols/add.xml';
import DownloadIcon from '@expo/material-symbols/download.xml';
import { List } from 'react-native-paper';

import { useDispatch } from 'react-redux';

export default function ProgramList() {
  const ps = useAppSelector(selectAllPrograms);
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
          onPress: () => dispatch(importPlanFromPicker()),
        },
      ]}
    />
  );
  return (
    <FullHeightScrollView floatingChildren={footer}>
      <Stack.Screen options={{ title: t('plan.plans.title') }} />
      <List.Section>
        {ps.map(({ id }) => (
          <ProgramListItem key={id} id={id} isFocused={focusprogramId === id} />
        ))}
      </List.Section>
    </FullHeightScrollView>
  );
}
