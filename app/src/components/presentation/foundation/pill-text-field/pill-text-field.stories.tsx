import type { Meta, StoryObj } from '@storybook/react-native';
import SendIcon from '@expo/material-symbols/send.xml';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { NativeIconButton } from '@/components/presentation/foundation/native-icon-button';
import { PillTextField } from '@/components/presentation/foundation/pill-text-field';

type Props = React.ComponentProps<typeof PillTextField>;

function StatefulPill({ value, ...rest }: Props) {
  const [text, setText] = useState(value);
  return <PillTextField {...rest} value={text} onChangeText={setText} />;
}

const meta = {
  title: 'Foundation/PillTextField',
  component: PillTextField,
  args: { value: '', placeholder: 'Ask the planner', multiline: false },
  render: (args) => <StatefulPill {...args} />,
} satisfies Meta<typeof PillTextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTrailing: Story = {
  args: {
    trailing: <NativeIconButton icon={SendIcon} systemImage="paperplane" label="Send" onPress={fn()} />,
  },
};

export const Multiline: Story = {
  args: { multiline: true, maxLines: 4, value: 'Build me a four day upper lower split\nwith one rest day between' },
};
