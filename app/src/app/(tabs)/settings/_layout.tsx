import StackWithHeader from '@/components/layout/stack-with-header';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <StackWithHeader>
      {/* Declaring a screen places it first in the stack's route order, so `index` must come before
          the nested plan stack or the settings tab would open straight into it with no programId. */}
      <Stack.Screen name="index" />
      <Stack.Screen name="manage-workouts/[programId]" options={{ headerShown: false }} />
    </StackWithHeader>
  );
}
