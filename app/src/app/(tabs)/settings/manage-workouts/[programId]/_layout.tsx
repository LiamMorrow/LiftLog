import StackWithHeader from '@/components/layout/stack-with-header';

// The anchor is the plan view, so deep-linking straight to a workout day from the
// home screen loads the plan view underneath it (Back returns to the plan, not settings).
export const unstable_settings = {
  initialRouteName: 'index',
};

export default function Layout() {
  return <StackWithHeader />;
}
