import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { fn } from 'storybook/test';
import FixedIncrementer from '@/components/presentation/foundation/editors/fixed-incrementer';

type Props = React.ComponentProps<typeof FixedIncrementer>;

function StatefulIncrementer({ value, ...rest }: Props) {
  const [current, setCurrent] = useState(value);
  return (
    <View style={{ width: 120 }}>
      <FixedIncrementer {...rest} value={current} onValueChange={setCurrent} />
    </View>
  );
}

const meta = {
  title: 'Foundation/Editors/FixedIncrementer',
  component: FixedIncrementer,
  args: { label: 'Sets', value: 3, onValueChange: fn() },
  render: (args) => <StatefulIncrementer {...args} />,
} satisfies Meta<typeof FixedIncrementer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
