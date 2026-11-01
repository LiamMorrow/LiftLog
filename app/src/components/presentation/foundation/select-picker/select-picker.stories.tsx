import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { View } from 'react-native';
import SelectPicker, { SelectPickerProps } from '@/components/presentation/foundation/select-picker';

function StatefulSelectPicker({ value, ...rest }: SelectPickerProps<string>) {
  const [selected, setSelected] = useState(value);
  return (
    <View style={{ alignItems: 'flex-start' }}>
      <SelectPicker {...rest} value={selected} onChange={setSelected} />
    </View>
  );
}

const meta = {
  title: 'Foundation/SelectPicker',
  component: SelectPicker<string>,
  args: {
    value: 'kilograms',
    options: [
      { value: 'kilograms', label: 'kg' },
      { value: 'pounds', label: 'lb' },
    ],
    onChange: fn(),
    enabled: true,
    appearance: 'menu',
  },
  argTypes: { appearance: { control: 'radio', options: ['menu', 'wheel'] } },
  render: (args) => <StatefulSelectPicker {...args} />,
} satisfies Meta<typeof SelectPicker<string>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Menu: Story = {};

export const Wheel: Story = {
  args: {
    value: '3',
    options: ['1', '2', '3', '4', '5'].map((value) => ({ value, label: `${value} sets` })),
    appearance: 'wheel',
  },
};

export const WithHiddenOption: Story = {
  args: {
    value: 'kilograms',
    options: [
      { value: 'kilograms', label: 'kg' },
      { value: 'pounds', label: 'lb' },
      { value: 'nil', label: 'None', disabledAndHidden: true },
    ],
  },
};

export const Disabled: Story = { args: { enabled: false } };
