import type { Meta, StoryObj } from '@storybook/react-native';
import { Duration } from '@js-joda/core';
import RestFormat from '@/components/presentation/foundation/rest-format';
import { Rest } from '@/models/blueprint-models';

const meta = {
  title: 'Foundation/RestFormat',
  component: RestFormat,
  args: { rest: Rest.short },
} satisfies Meta<typeof RestFormat>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Short: Story = {};

export const Long: Story = { args: { rest: Rest.long } };

export const FixedRest: Story = {
  args: {
    rest: { minRest: Duration.ofSeconds(90), maxRest: Duration.ofSeconds(90), failureRest: Duration.ofSeconds(60) },
  },
};
