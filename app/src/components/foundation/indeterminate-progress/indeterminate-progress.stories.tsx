import type { Meta, StoryObj } from '@storybook/react-native';
import { IndeterminateProgress } from '@/components/foundation/indeterminate-progress';

const meta = {
  title: 'Foundation/IndeterminateProgress',
  component: IndeterminateProgress,
} satisfies Meta<typeof IndeterminateProgress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
