import { LazyTabStack } from '@/components/layout/lazy-tab-stack';

export const unstable_settings = {
  initialRouteName: 'index',
};
export default function Layout() {
  return <LazyTabStack />;
}
