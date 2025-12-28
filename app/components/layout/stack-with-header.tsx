import MaterialStackHeader from '@/components/presentation/material-stack-header';
import { ScrollProvider } from '@/hooks/useScrollListener';
import { Stack } from 'expo-router';

export default function StackWithHeader() {
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
