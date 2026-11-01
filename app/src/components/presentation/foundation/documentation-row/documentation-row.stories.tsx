import type { Meta, StoryObj } from '@storybook/react-native';
import { DocumentationRow } from '@/components/presentation/foundation/documentation-row';

const meta = {
  title: 'Foundation/DocumentationRow',
  component: DocumentationRow,
  args: { doc: 'Progression.md' },
} satisfies Meta<typeof DocumentationRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
