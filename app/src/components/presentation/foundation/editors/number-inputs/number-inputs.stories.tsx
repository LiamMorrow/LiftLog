import type { Meta, StoryObj } from '@storybook/react-native';
import { Duration } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import {
  DecimalInput,
  DurationInput,
  IntegerInput,
  NumberInputSize,
} from '@/components/presentation/foundation/editors/number-inputs';

function StatefulDecimal({ size }: { size: NumberInputSize }) {
  const [value, setValue] = useState(new BigNumber('82.5'));
  return <DecimalInput value={value} onChange={setValue} accessibilityLabel="Weight" minWidth={96} size={size} />;
}

function StatefulInteger({ size }: { size: NumberInputSize }) {
  const [value, setValue] = useState(8);
  return <IntegerInput value={value} onChange={setValue} accessibilityLabel="Reps" minWidth={64} size={size} />;
}

function StatefulDuration({ size, showHours }: { size: NumberInputSize; showHours?: boolean }) {
  const [value, setValue] = useState(Duration.ofSeconds(90));
  return <DurationInput duration={value} onDurationUpdated={setValue} showHours={showHours} size={size} />;
}

function NumberInputs({ size }: { size: NumberInputSize }) {
  return <StatefulDecimal size={size} />;
}

const meta = {
  title: 'Foundation/Editors/NumberInputs',
  component: NumberInputs,
  args: { size: 'regular' },
  argTypes: { size: { control: 'radio', options: ['regular', 'large'] } },
} satisfies Meta<typeof NumberInputs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Decimal: Story = {};

export const Integer: Story = { render: (args) => <StatefulInteger {...args} /> };

export const DurationMinutesSeconds: Story = { render: (args) => <StatefulDuration {...args} /> };

export const DurationWithHours: Story = { render: (args) => <StatefulDuration {...args} showHours /> };

export const Large: Story = { args: { size: 'large' } };
