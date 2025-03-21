import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import MaterialStackHeader from '@/components/presentation/material-stack-header';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        header: MaterialStackHeader,
      }}
      layout={(p) => <FullHeightScrollView>{p.children}</FullHeightScrollView>}
    ></Stack>
  );
}
