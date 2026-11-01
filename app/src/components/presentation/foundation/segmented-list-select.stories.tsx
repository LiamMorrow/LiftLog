import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSelect } from '@/components/presentation/foundation/segmented-list-select';

type Props = React.ComponentProps<typeof SegmentedListSelect<string>>;

function StatefulSelectRow({ value, ...rest }: Props) {
  const [selected, setSelected] = useState(value);
  return (
    <SegmentedGroup>
      <SegmentedListSelect {...rest} value={selected} onChange={setSelected} />
    </SegmentedGroup>
  );
}

const meta = {
  title: 'Foundation/SegmentedListSelect',
  component: SegmentedListSelect<string>,
  args: {
    label: 'Weight unit',
    value: 'kg',
    options: [
      { value: 'kg', label: 'Kilograms' },
      { value: 'lb', label: 'Pounds' },
    ],
    onChange: fn(),
    enabled: true,
  },
  render: (args) => <StatefulSelectRow {...args} />,
} satisfies Meta<typeof SegmentedListSelect<string>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSupportingText: Story = { args: { supportingText: 'Used for every exercise' } };

export const Disabled: Story = { args: { enabled: false } };
