import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { AppText, textVariants } from '@/components/presentation/foundation/app-text';

const meta = {
  title: 'Foundation/AppText',
  component: AppText,
  args: { children: 'Bench press' },
  argTypes: { variant: { control: 'select', options: Object.keys(textVariants) } },
} satisfies Meta<typeof AppText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { variant: 'bodyLarge' } };

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      {Object.keys(textVariants).map((variant) => (
        <AppText key={variant} variant={variant as keyof typeof textVariants}>
          {variant}
        </AppText>
      ))}
    </View>
  ),
};
