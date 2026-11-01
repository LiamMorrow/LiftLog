import type { Meta, StoryObj } from '@storybook/react-native';
import { textVariants } from '@/components/presentation/foundation/app-text';
import WeightFormat from '@/components/presentation/foundation/weight-format';
import { Weight } from '@/models/weight';

const meta = {
  title: 'Foundation/WeightFormat',
  component: WeightFormat,
  args: { weight: new Weight(82.5, 'kilograms'), variant: 'bodyLarge', usesBodyweight: false },
  argTypes: { variant: { control: 'select', options: Object.keys(textVariants) } },
} satisfies Meta<typeof WeightFormat>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Kilograms: Story = {};

export const Pounds: Story = { args: { weight: new Weight(185, 'pounds') } };

export const NoWeight: Story = { args: { weight: undefined } };

export const Bodyweight: Story = { args: { weight: new Weight(0, 'kilograms'), usesBodyweight: true } };

export const BodyweightPlusLoad: Story = { args: { weight: new Weight(10, 'kilograms'), usesBodyweight: true } };

export const Assisted: Story = { args: { weight: new Weight(-20, 'kilograms'), usesBodyweight: true } };

export const Rounded: Story = { args: { weight: new Weight('82.3456', 'kilograms'), decimalPlaces: 1 } };
