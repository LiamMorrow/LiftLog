import type { Meta, StoryObj } from '@storybook/react-native';
import { LocalDate } from '@js-joda/core';
import { useState } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { DateRangePicker } from '@/components/presentation/foundation/date-range-picker';
import { NativeButton } from '@/components/presentation/foundation/native-button';
import { LocalDateRange } from '@/models/time-models';

function OpenableDateRangePicker() {
  const [visible, setVisible] = useState(false);
  const [range, setRange] = useState<LocalDateRange>({ from: LocalDate.now().minusWeeks(4), to: LocalDate.now() });
  return (
    <View style={{ gap: 8 }}>
      <AppText>
        {range.from.toString()} to {range.to.toString()}
      </AppText>
      <NativeButton variant="tonal" label="Choose range" onPress={() => setVisible(true)} />
      <DateRangePicker
        visible={visible}
        value={range}
        onConfirm={(value) => {
          setRange(value);
          setVisible(false);
        }}
        onDismiss={() => setVisible(false)}
      />
    </View>
  );
}

const meta = {
  title: 'Foundation/DateRangePicker',
  component: OpenableDateRangePicker,
} satisfies Meta<typeof OpenableDateRangePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
