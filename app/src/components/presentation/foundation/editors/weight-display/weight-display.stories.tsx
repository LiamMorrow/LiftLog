import type { Meta, StoryObj } from '@storybook/react-native';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { View } from 'react-native';
import WeightDisplay from '@/components/presentation/foundation/editors/weight-display';
import { EditDockHost, EditDockProvider } from '@/components/presentation/workout/edit-dock';
import { Weight } from '@/models/weight';

function DockedWeightDisplay({ isReadonly }: { isReadonly: boolean }) {
  const [weight, setWeight] = useState(new Weight(82.5, 'kilograms'));
  return (
    <EditDockProvider>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <WeightDisplay
          weight={weight}
          updateWeight={setWeight}
          increment={new BigNumber('2.5')}
          isReadonly={isReadonly}
        />
        <EditDockHost>
          <View style={{ height: 1 }} />
        </EditDockHost>
      </View>
    </EditDockProvider>
  );
}

const meta = {
  title: 'Foundation/Editors/WeightDisplay',
  component: DockedWeightDisplay,
  args: { isReadonly: false },
} satisfies Meta<typeof DockedWeightDisplay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Editable: Story = {};

export const ReadOnly: Story = { args: { isReadonly: true } };
