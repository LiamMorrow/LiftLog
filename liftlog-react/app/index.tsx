import PotentialSetCounter from '@/components/presentation/potential-set-counter';
import { useBaseThemeset } from '@/hooks/useBaseThemeset';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { View } from 'react-native';

export default function Index() {
  const style = useBaseThemeset();
  const [weight, setWeight] = useState(new BigNumber(100));
  const [showWeight, setShowWeight] = useState(true);

  return (
    <View
      style={style}
      // className="flex-1 items-center justify-center gap-y-2 text-center"
    >
      <View
      // className="items-center"
      >
        <PotentialSetCounter
          isReadonly={false}
          maxReps={8}
          onTap={() => {
            setShowWeight(!showWeight);
          }}
          onHold={() => {
            console.log('held');
          }}
          onUpdateWeight={setWeight}
          set={{
            set: undefined,
            weight: weight,
          }}
          showWeight={showWeight}
          toStartNext={false}
          weightIncrement={BigNumber(5)}
        />
      </View>
    </View>
  );
}
