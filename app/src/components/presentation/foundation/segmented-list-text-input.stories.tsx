import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListTextInput } from '@/components/presentation/foundation/segmented-list-text-input';

type Props = React.ComponentProps<typeof SegmentedListTextInput>;

function StatefulInputRow({ value, ...rest }: Props) {
  const [text, setText] = useState(value);
  return (
    <SegmentedGroup>
      <SegmentedListTextInput {...rest} value={text} onChangeText={setText} />
    </SegmentedGroup>
  );
}

const meta = {
  title: 'Foundation/SegmentedListTextInput',
  component: SegmentedListTextInput,
  args: { label: 'Plan name', value: 'Push Pull Legs', error: false },
  render: (args) => <StatefulInputRow {...args} />,
} satisfies Meta<typeof SegmentedListTextInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { args: { value: '', placeholder: 'Name your plan' } };

export const WithSupportingText: Story = { args: { supportingText: 'Shown on your home screen' } };

export const Error: Story = { args: { error: true, supportingText: 'A plan needs a name' } };
