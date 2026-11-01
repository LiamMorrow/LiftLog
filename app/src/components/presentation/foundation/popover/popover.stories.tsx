import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { NativeButton } from '@/components/presentation/foundation/native-button';
import { Popover } from '@/components/presentation/foundation/popover';

const meta = {
  title: 'Foundation/Popover',
  component: Popover,
  args: {
    accessibilityLabel: 'Superset help',
    width: 300,
    trigger: (open: () => void) => <NativeButton variant="tonal" label="What is a superset?" onPress={open} />,
    children: (close: () => void) => (
      <View style={{ padding: 16, gap: 8 }}>
        <AppText variant="bodyMedium">Two exercises done back to back, resting only after both.</AppText>
        <NativeButton variant="text" label="Got it" onPress={close} />
      </View>
    ),
  },
  render: (args) => (
    <View style={{ alignItems: 'flex-start' }}>
      <Popover {...args} />
    </View>
  ),
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Narrow: Story = { args: { width: 200 } };
