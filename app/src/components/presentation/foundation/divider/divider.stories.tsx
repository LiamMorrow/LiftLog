import type { Meta, StoryObj } from '@storybook/react-native';
import { Divider } from '@/components/presentation/foundation/divider';

const meta = {
  title: 'Foundation/Divider',
  component: Divider,
} satisfies Meta<typeof Divider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
