import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Switch, SwitchProps } from '@/components/presentation/foundation/switch';

function StatefulSwitch({ value, ...rest }: SwitchProps) {
  const [checked, setChecked] = useState(value);
  return <Switch {...rest} value={checked} onValueChange={setChecked} />;
}

const meta = {
  title: 'Foundation/Switch',
  component: Switch,
  args: { value: false, disabled: false, onValueChange: fn() },
  render: (args) => <StatefulSwitch {...args} />,
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = { args: { value: true } };

export const Disabled: Story = { args: { disabled: true } };
