import CardList from '@/components/presentation/card-list';
import EmptyInfo from '@/components/presentation/empty-info';
import FloatingBottomContainer from '@/components/presentation/floating-bottom-container';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import LimitedHtml from '@/components/presentation/limited-html';
import ManageWorkoutCardContent from '@/components/smart/manage-workout-card-content';
import { spacing } from '@/hooks/useAppTheme';
import { useAppSelectorWithArg } from '@/store';
import { selectProgram, setSavedPlanName } from '@/store/program';
import { useTranslate } from '@tolgee/react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { FAB, TextInput } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function ManageWorkouts() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const program = useAppSelectorWithArg(selectProgram, programId);
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const addWorkout = () => {
    // TODO
  };
  const floatingBottomContainer = (
    <FloatingBottomContainer
      fab={
        <FAB
          variant="surface"
          size="small"
          icon="add"
          label={t('AddWorkout')}
          onPress={addWorkout}
        />
      }
    />
  );
  const emptyInfo = program.sessions.length ? undefined : (
    <EmptyInfo>
      <LimitedHtml value={t('NoWorkoutsInPlan')} />
    </EmptyInfo>
  );
  return (
    <FullHeightScrollView floatingChildren={floatingBottomContainer}>
      <Stack.Screen options={{ title: program.name }} />
      <TextInput
        style={{ marginHorizontal: spacing[2] }}
        value={program.name}
        mode="flat"
        onChangeText={(name) =>
          dispatch(setSavedPlanName({ planId: programId, name }))
        }
      />
      {emptyInfo}

      <CardList
        items={program.sessions}
        cardType="outlined"
        renderItem={(session) => <ManageWorkoutCardContent session={session} />}
      />
    </FullHeightScrollView>
  );
}
