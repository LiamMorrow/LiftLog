import type { Meta, StoryObj } from '@storybook/react-native';
import LimitedHtml from '@/components/presentation/foundation/limited-html';

const meta = {
  title: 'Foundation/LimitedHtml',
  component: LimitedHtml,
  args: { value: 'You lifted <em>12,000 kg</em> this week.<br>That is <em>20%</em> more than last week.' },
} satisfies Meta<typeof LimitedHtml>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PlainText: Story = { args: { value: 'Nothing highlighted here' } };

export const CustomEmphasis: Story = { args: { emStyles: { fontStyle: 'italic', textDecorationLine: 'underline' } } };
