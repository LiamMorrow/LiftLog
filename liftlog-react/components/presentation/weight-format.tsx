import BigNumber from 'bignumber.js';
import { Text } from 'react-native';

interface WeightFormatProps {
  weight: BigNumber | undefined;
  suffixClass?: string;
}
export default function WeightFormat(props: WeightFormatProps) {
  const weightDisplay = props.weight?.decimalPlaces(4).toFormat() ?? '-';
  const suffixClass = props.suffixClass ?? 'text-sm';

  // TODO: get from settings context
  const suffix = 'kg';

  return (
    <Text className="flex items-center flex-row">
      {weightDisplay}
      <Text className={suffixClass}>{suffix}</Text>
    </Text>
  );
}
