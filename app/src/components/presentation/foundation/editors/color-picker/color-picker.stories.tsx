import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { ColorPicker } from '@/components/presentation/foundation/editors/color-picker';

const meta = {
  title: 'Foundation/Editors/ColorPicker',
  component: ColorPicker,
  args: { initialSeed: '#005500', onSave: fn() },
} satisfies Meta<typeof ColorPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CustomSeed: Story = {};

export const DefaultSeed: Story = { args: { initialSeed: 'default' } };
