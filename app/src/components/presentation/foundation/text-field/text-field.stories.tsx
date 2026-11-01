import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { textVariants } from '@/components/presentation/foundation/app-text';
import { TextField } from '@/components/presentation/foundation/text-field';

type Props = React.ComponentProps<typeof TextField>;

function StatefulTextField({ value, ...rest }: Props) {
  const [text, setText] = useState(value);
  return <TextField {...rest} value={text} onChangeText={setText} />;
}

const meta = {
  title: 'Foundation/TextField',
  component: TextField,
  args: { value: 'Push day', placeholder: 'Name', variant: 'bodyLarge', readOnly: false, multiline: false },
  argTypes: {
    variant: { control: 'select', options: Object.keys(textVariants) },
    underline: { control: 'radio', options: [undefined, 'always', 'focused'] },
  },
  render: (args) => <StatefulTextField {...args} />,
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Plain: Story = {};

export const UnderlineAlways: Story = { args: { underline: 'always' } };

export const UnderlineWhenFocused: Story = { args: { underline: 'focused' } };

export const Placeholder: Story = { args: { value: '' } };

export const ReadOnly: Story = { args: { underline: 'always', readOnly: true } };

export const Multiline: Story = { args: { multiline: true, value: 'Keep elbows tucked\nPause at the bottom' } };
