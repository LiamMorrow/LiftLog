import type { Meta, StoryObj } from '@storybook/react-native';
import { useContext } from 'react';
import { fn } from 'storybook/test';
import { Confirmation, ConfirmContext } from '@/components/presentation/foundation/confirm';
import { NativeButton } from '@/components/presentation/foundation/native-button';

function ConfirmTrigger(props: Confirmation) {
  const confirm = useContext(ConfirmContext);
  return <NativeButton variant="tonal" label="Ask for confirmation" onPress={() => confirm(props)} />;
}

const meta = {
  title: 'Foundation/Confirm',
  component: ConfirmTrigger,
  args: {
    title: 'Delete workout?',
    message: 'This cannot be undone.',
    okText: 'Delete',
    cancelText: 'Cancel',
    destructive: true,
    onOk: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof ConfirmTrigger>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Destructive: Story = {};

export const Neutral: Story = {
  args: {
    title: 'Start a new workout?',
    message: 'Your plan moves on to the next session.',
    okText: 'Start',
    destructive: false,
  },
};

export const WithAdditionalAction: Story = {
  args: { additionalAction: { text: 'Save as draft', onPress: fn() } },
};
