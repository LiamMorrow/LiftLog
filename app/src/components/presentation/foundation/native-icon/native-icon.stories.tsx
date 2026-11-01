import type { Meta, StoryObj } from '@storybook/react-native';
import ChevronRightIcon from '@expo/material-symbols/chevron_right.xml';
import FitnessCenterIcon from '@expo/material-symbols/fitness_center.xml';
import { NativeIcon } from '@/components/presentation/foundation/native-icon';

const meta = {
  title: 'Foundation/NativeIcon',
  component: NativeIcon,
  args: { icon: FitnessCenterIcon, systemImage: 'dumbbell', size: 24 },
  argTypes: { size: { control: { type: 'number', min: 12, max: 96, step: 4 } } },
} satisfies Meta<typeof NativeIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = { args: { size: 64 } };

export const Coloured: Story = { args: { color: '#D32F2F' } };

export const Mirrored: Story = { args: { icon: ChevronRightIcon, systemImage: 'chevron.right', mirrored: true } };
