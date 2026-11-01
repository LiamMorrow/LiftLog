import type { Meta, StoryObj } from '@storybook/react-native';
import { Loader } from '@/components/presentation/foundation/loader';

const meta = {
  title: 'Foundation/Loader',
  component: Loader,
} satisfies Meta<typeof Loader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithText: Story = { args: { loadingText: 'Restoring your backup' } };
