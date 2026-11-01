import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { SearchField } from '@/components/presentation/foundation/search-field';

type Props = React.ComponentProps<typeof SearchField>;

function StatefulSearch({ value, ...rest }: Props) {
  const [text, setText] = useState(value);
  return <SearchField {...rest} value={text} onChangeText={setText} />;
}

const meta = {
  title: 'Foundation/SearchField',
  component: SearchField,
  args: { value: '', onChangeText: fn() },
  render: (args) => <StatefulSearch {...args} />,
} satisfies Meta<typeof SearchField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithQuery: Story = { args: { value: 'Bench' } };

export const CustomPlaceholder: Story = { args: { placeholder: 'Find an exercise' } };
