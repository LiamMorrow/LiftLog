import { View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';

export default function PotentialSetCounter() {
  return (
    <TouchableRipple
      className="aspect-square rounded-lg p-0 h-14 w-14 items-center justify-center bg-secondary-container"
      onPress={() => {}}
    >
      <Text>
        <Text className="font-bold text-lg">-</Text>
        <Text className="text-xm">/11</Text>
      </Text>
    </TouchableRipple>
  );
}
