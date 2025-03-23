import MaterialStackHeader from '@/components/presentation/material-stack-header';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        header: MaterialStackHeader,
      }}
    ></Stack>
  );
}
