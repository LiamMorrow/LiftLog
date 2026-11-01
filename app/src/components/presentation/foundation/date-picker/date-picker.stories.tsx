import type { Meta, StoryObj } from '@storybook/react-native';
import { LocalDate } from '@js-joda/core';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { DatePicker, DatePickerProps } from '@/components/presentation/foundation/date-picker';

function StatefulDatePicker({ value, ...rest }: DatePickerProps) {
  const [date, setDate] = useState(value);
  return <DatePicker {...rest} value={date} onChange={setDate} />;
}

const meta = {
  title: 'Foundation/DatePicker',
  component: DatePicker,
  args: { value: LocalDate.now(), onChange: fn() },
  render: (args) => <StatefulDatePicker {...args} />,
} satisfies Meta<typeof DatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Today: Story = {};

export const LastYear: Story = { args: { value: LocalDate.now().minusYears(1) } };
