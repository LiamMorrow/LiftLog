import type { Meta, StoryObj } from '@storybook/react-native';
import DirectionsRunIcon from '@expo/material-symbols/directions_run.xml';
import FitnessCenterIcon from '@expo/material-symbols/fitness_center.xml';
import { useState } from 'react';
import { fn } from 'storybook/test';
import SegmentedPicker, { SegmentedPickerProps } from '@/components/presentation/foundation/segmented-picker';

function StatefulSegmentedPicker({ value, ...rest }: SegmentedPickerProps<string>) {
  const [selected, setSelected] = useState(value);
  return <SegmentedPicker {...rest} value={selected} onChange={setSelected} />;
}

const meta = {
  title: 'Foundation/SegmentedPicker',
  component: SegmentedPicker<string>,
  args: {
    value: 'week',
    options: [
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month' },
      { value: 'year', label: 'Year' },
    ],
    onChange: fn(),
    enabled: true,
    equalWidth: true,
  },
  render: (args) => <StatefulSegmentedPicker {...args} />,
} satisfies Meta<typeof SegmentedPicker<string>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcons: Story = {
  args: {
    value: 'weighted',
    options: [
      { value: 'weighted', label: 'Weighted', icon: FitnessCenterIcon, systemImage: 'dumbbell' },
      { value: 'cardio', label: 'Cardio', icon: DirectionsRunIcon, systemImage: 'figure.run' },
    ],
  },
};

export const ContentWidth: Story = { args: { equalWidth: false } };

export const Disabled: Story = { args: { enabled: false } };
