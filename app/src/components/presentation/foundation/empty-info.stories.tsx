import type { Meta, StoryObj } from '@storybook/react-native';
import FitnessCenterIcon from '@expo/material-symbols/fitness_center.xml';
import EmptyInfo from '@/components/presentation/foundation/empty-info';

const meta = {
  title: 'Foundation/EmptyInfo',
  component: EmptyInfo,
  args: { children: 'No workouts yet' },
} satisfies Meta<typeof EmptyInfo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = { args: { icon: FitnessCenterIcon, systemImage: 'dumbbell' } };
