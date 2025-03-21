import { Link } from 'expo-router';
import { Text } from 'react-native';

export default function Settings() {
  return (
    <Text>
      <Link href="/settings/app-configuration">Hi</Link>
    </Text>
  );
}
