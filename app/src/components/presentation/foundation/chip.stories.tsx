import type { Meta, StoryObj } from '@storybook/react-native';
import FitnessCenterIcon from '@expo/material-symbols/fitness_center.xml';
import { fn } from 'storybook/test';
import { Chip } from '@/components/presentation/foundation/chip';

const meta = {
  title: 'Foundation/Chip',
  component: Chip,
  args: { children: 'Chest', onPress: fn(), selected: false, mode: 'flat' },
  argTypes: { mode: { control: 'radio', options: ['flat', 'outlined'] } },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Flat: Story = {};

export const Outlined: Story = { args: { mode: 'outlined' } };

export const Selected: Story = { args: { selected: true } };

export const WithIcon: Story = { args: { icon: FitnessCenterIcon, systemImage: 'dumbbell' } };
