import type { Meta, StoryObj } from '@storybook/react-native';
import { SectionHeader } from '@/components/presentation/foundation/section-header';

const meta = {
  title: 'Foundation/SectionHeader',
  component: SectionHeader,
  args: { title: 'Recent workouts' },
} satisfies Meta<typeof SectionHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTrailingText: Story = { args: { trailing: 'See all' } };
