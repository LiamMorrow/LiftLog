import PageMenu from '@/components/presentation/foundation/page-menu';
import { useAppSelector } from '@/store';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';

export function usePlanNavigation() {
  const activeProgramId = useAppSelector((s) => s.program.activePlanId);
  const { push } = useRouter();

  return {
    choosePlan: () => push('/settings/program-list', { withAnchor: true }),
    editWorkouts: () => push(`/settings/manage-workouts/${activeProgramId}`, { withAnchor: true }),
  };
}

export default function PlanMenu() {
  const { t } = useTranslate();
  const { choosePlan, editWorkouts } = usePlanNavigation();

  return (
    <PageMenu
      testID="plan-menu"
      items={[
        {
          label: t('plan.choose.button'),
          icon: 'assignment',
          systemImage: 'list.clipboard',
          onPress: choosePlan,
        },
        {
          label: t('workout.edit_workouts.button'),
          icon: 'edit',
          systemImage: 'pencil',
          onPress: editWorkouts,
        },
      ]}
    />
  );
}
