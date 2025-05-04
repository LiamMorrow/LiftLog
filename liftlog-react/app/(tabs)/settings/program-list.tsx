import FloatingBottomContainer from '@/components/presentation/floating-bottom-container';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import ListTitle from '@/components/presentation/list-title';
import ProgramListItem from '@/components/smart/program-list-item';
import { useAppSelector } from '@/store';
import { selectAllPrograms } from '@/store/program';
import { useTranslate } from '@tolgee/react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { FAB, List } from 'react-native-paper';

export default function ProgramList() {
  const ps = useAppSelector(selectAllPrograms);
  const { t } = useTranslate();
  const { focusprogramId } = useLocalSearchParams<{
    focusprogramId?: string;
  }>();
  const addProgram = () => {
    //TODO
  };
  const floatingBottomContainer = (
    <FloatingBottomContainer
      fab={
        <FAB
          variant="surface"
          size="small"
          icon="add"
          label={t('AddPlan')}
          onPress={addProgram}
        />
      }
    />
  );
  return (
    <FullHeightScrollView floatingChildren={floatingBottomContainer}>
      <Stack.Screen options={{ title: t('PlansPageTitle') }} />
      <List.Section>
        <ListTitle title={t('SavedPlans')} />
        {ps.map(({ id }) => (
          <ProgramListItem key={id} id={id} isFocused={focusprogramId === id} />
        ))}
      </List.Section>
    </FullHeightScrollView>
  );
}
