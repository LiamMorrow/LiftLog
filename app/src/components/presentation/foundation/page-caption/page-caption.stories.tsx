import type { Meta, StoryObj } from '@storybook/react-native';
import { PageCaption } from '@/components/presentation/foundation/page-caption';

const meta = {
  title: 'Foundation/PageCaption',
  component: PageCaption,
  args: { value: 'Backups are <em>encrypted</em> before they leave your device.' },
} satisfies Meta<typeof PageCaption>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
