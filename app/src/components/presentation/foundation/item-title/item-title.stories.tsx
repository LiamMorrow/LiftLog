import type { Meta, StoryObj } from '@storybook/react-native';
import ItemTitle from '@/components/presentation/foundation/item-title';

const meta = {
  title: 'Foundation/ItemTitle',
  component: ItemTitle,
  args: { title: 'Bench press' },
} satisfies Meta<typeof ItemTitle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = { args: { color: 'primary' } };

export const LongTitle: Story = { args: { title: 'Single arm dumbbell row with a pause at the top of every rep' } };
