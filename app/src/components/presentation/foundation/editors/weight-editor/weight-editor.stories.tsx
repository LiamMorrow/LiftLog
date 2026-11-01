import type { Meta, StoryObj } from '@storybook/react-native';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { WeightEditor } from '@/components/presentation/foundation/editors/weight-editor';
import WeightFormat from '@/components/presentation/foundation/weight-format';
import { Weight } from '@/models/weight';

function StatefulWeightEditor({ allowNegative, increment }: { allowNegative: boolean; increment: number }) {
  const [weight, setWeight] = useState(new Weight(60, 'kilograms'));
  return (
    <View style={{ gap: 16 }}>
      <WeightEditor
        weight={weight}
        updateWeight={setWeight}
        increment={new BigNumber(increment)}
        allowNegative={allowNegative}
      />
      <WeightFormat weight={weight} />
    </View>
  );
}

function NullableWeightEditor() {
  const [weight, setWeight] = useState<Weight | undefined>(undefined);
  return (
    <View style={{ gap: 16 }}>
      <WeightEditor allowNull weight={weight} updateWeight={setWeight} increment={new BigNumber('2.5')} />
      <AppText>{weight ? weight.value.toString() : 'No weight'}</AppText>
    </View>
  );
}

const meta = {
  title: 'Foundation/Editors/WeightEditor',
  component: StatefulWeightEditor,
  args: { allowNegative: false, increment: 2.5 },
} satisfies Meta<typeof StatefulWeightEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllowNegative: Story = { args: { allowNegative: true } };

export const Nullable: Story = { render: () => <NullableWeightEditor /> };
