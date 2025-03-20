import SessionComponent from '@/components/smart/session-component';
import { useAppTheme } from '@/hooks/useAppTheme';
import { RootState } from '@/store';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function Index() {
  const { colors } = useAppTheme();
  const dispatch = useDispatch();
  const session = useSelector(
    (state: RootState) => state.currentSession.workoutSession,
  );

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          height: '100%',
        },
      ]}
    >
      <Stack.Screen options={{ title: session?.blueprint.name }} />

      <SessionComponent target="workoutSession" showBodyweight={true} />
    </View>
  );
}
