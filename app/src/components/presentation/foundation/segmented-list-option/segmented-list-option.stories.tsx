import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListOption } from '@/components/presentation/foundation/segmented-list-option';

const options = [
  { value: 'kg', label: 'Kilograms', supportingText: 'Metric' },
  { value: 'lb', label: 'Pounds', supportingText: 'Imperial' },
  { value: 'st', label: 'Stone' },
];

function StatefulOptions() {
  const [selected, setSelected] = useState('kg');
  return (
    <SegmentedGroup>
      {options.map((option) => (
        <SegmentedListOption
          key={option.value}
          label={option.label}
          supportingText={option.supportingText}
          selected={option.value === selected}
          onPress={() => setSelected(option.value)}
        />
      ))}
    </SegmentedGroup>
  );
}

const meta = {
  title: 'Foundation/SegmentedListOption',
  component: StatefulOptions,
} satisfies Meta<typeof StatefulOptions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
