import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { ListItem } from '@/components/presentation/foundation/list-item';

const meta = {
  title: 'Foundation/ListItem',
  component: ListItem,
  args: { title: 'Bench press' },
} satisfies Meta<typeof ListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = { args: { description: 'Chest, triceps, shoulders' } };

export const Pressable: Story = { args: { description: 'Tap to add', onPress: fn() } };

export const TruncatedDescription: Story = {
  args: {
    description:
      'Lie flat on the bench, grip the bar just wider than shoulder width, lower it to your chest and press it back up.',
    descriptionNumberOfLines: 1,
  },
};
