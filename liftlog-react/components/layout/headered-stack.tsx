import MaterialStackHeader from '@/components/presentation/material-stack-header';
import { ScrollProvider } from '@/hooks/useScollListener';
import { Stack } from 'expo-router';

export default function HeaderedStack() {
  return (
    <ScrollProvider>
      <Stack
        screenOptions={{
          header: (props) => <MaterialStackHeader {...props} />,
          gestureEnabled: true,
        }}
      ></Stack>
    </ScrollProvider>
  );
}
