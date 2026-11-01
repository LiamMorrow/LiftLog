import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { fn } from 'storybook/test';
import {
  NegateWeightButton,
  WeightInputControls,
} from '@/components/presentation/foundation/editors/weight-input-controls';
import WeightFormat from '@/components/presentation/foundation/weight-format';
import { Weight } from '@/models/weight';

type Props = React.ComponentProps<typeof WeightInputControls>;

function StatefulControls({ text, unit, ...rest }: Props) {
  const [currentText, setText] = useState(text);
  const [currentUnit, setUnit] = useState(unit);
  return (
    <WeightInputControls
      {...rest}
      text={currentText}
      onChangeText={setText}
      unit={currentUnit}
      onUnitChange={setUnit}
    />
  );
}

function StatefulNegate() {
  const [weight, setWeight] = useState(new Weight(20, 'kilograms'));
  return (
    <>
      <NegateWeightButton weight={weight} onChange={setWeight} />
      <WeightFormat weight={weight} />
    </>
  );
}

const meta = {
  title: 'Foundation/Editors/WeightInputControls',
  component: WeightInputControls,
  args: {
    text: '60',
    onChangeText: fn(),
    unit: 'kilograms',
    onUnitChange: fn(),
    onIncrement: fn(),
    onDecrement: fn(),
    autoFocus: false,
  },
  render: (args) => <StatefulControls {...args} />,
} satisfies Meta<typeof WeightInputControls>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pounds: Story = { args: { text: '135', unit: 'pounds' } };

export const NegateButton: Story = { render: () => <StatefulNegate /> };
