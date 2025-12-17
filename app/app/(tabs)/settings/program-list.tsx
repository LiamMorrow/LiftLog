import FloatingBottomContainer from '@/components/presentation/floating-bottom-container';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import ProgramListItem from '@/components/smart/program-list-item';
import { ProgramBlueprint } from '@/models/blueprint-models';
import { useAppSelector } from '@/store';
import { savePlan, selectAllPrograms } from '@/store/program';
import { uuid } from '@/utils/uuid';
import { LocalDate } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FAB, List } from 'react-native-paper';

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
        programBlueprint: new ProgramBlueprint(
          t('plan.new_default_name.label'),
          [],
          LocalDate.now(),
        ),
      }),
    );
    push(`/(tabs)/settings/manage-workouts/${programId}/`);
  };
  const floatingBottomContainer = (
    <FloatingBottomContainer
      fab={
        <FAB
          variant="surface"
          size="small"
          icon={'add'}
          label={t('plan.add.button')}
          onPress={addProgram}
        />
      }
    />
  );
  return (
    <FullHeightScrollView floatingChildren={floatingBottomContainer}>
      <Stack.Screen options={{ title: t('plan.plans.title') }} />
      <List.Section>
        {ps.map(({ id }) => (
          <ProgramListItem key={id} id={id} isFocused={focusprogramId === id} />
        ))}
      </List.Section>
    </FullHeightScrollView>
  );
}
