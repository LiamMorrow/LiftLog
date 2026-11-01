import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { NativeButton } from '@/components/presentation/foundation/native-button';

const meta = {
  title: 'Foundation/NativeButton',
  component: NativeButton,
  args: { label: 'Start workout', onPress: fn(), variant: 'filled', disabled: false, loading: false, compact: false },
  argTypes: { variant: { control: 'select', options: ['filled', 'tonal', 'outlined', 'text'] } },
} satisfies Meta<typeof NativeButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Filled: Story = {};

export const Tonal: Story = { args: { variant: 'tonal' } };

export const Outlined: Story = { args: { variant: 'outlined' } };

export const Text: Story = { args: { variant: 'text' } };

export const Loading: Story = { args: { loading: true } };

export const Disabled: Story = { args: { disabled: true } };
