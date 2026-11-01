import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { AppText } from '@/components/presentation/foundation/app-text';
import { Remote } from '@/components/presentation/foundation/remote';
import { RemoteData } from '@/models/remote';

const meta = {
  title: 'Foundation/Remote',
  component: Remote<string>,
  args: {
    value: RemoteData.success('Loaded 12 workouts'),
    success: (value: string) => <AppText variant="bodyLarge">{value}</AppText>,
  },
} satisfies Meta<typeof Remote<string>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Success: Story = {};

export const Loading: Story = { args: { value: RemoteData.loading() } };

export const NotAsked: Story = { args: { value: RemoteData.notAsked() } };

export const Error: Story = { args: { value: RemoteData.error('Could not reach the server') } };

export const ErrorWithRetry: Story = {
  args: { value: RemoteData.error('Could not reach the server'), retry: fn() },
};
