import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSwitch } from '@/components/presentation/foundation/segmented-list-switch';
import NotificationsIcon from '@expo/material-symbols/notifications.xml';

function StatefulSwitchRow({ value, ...rest }: React.ComponentProps<typeof SegmentedListSwitch>) {
  const [checked, setChecked] = useState(value);
  return (
    <SegmentedGroup>
      <SegmentedListSwitch {...rest} value={checked} onValueChange={setChecked} />
    </SegmentedGroup>
  );
}

const meta = {
  title: 'Foundation/SegmentedListSwitch',
  component: SegmentedListSwitch,
  args: { label: 'Rest timer notifications', value: false, onValueChange: fn(), disabled: false, focus: false },
  render: (args) => <StatefulSwitchRow {...args} />,
} satisfies Meta<typeof SegmentedListSwitch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = { args: { value: true } };

export const WithSupportingText: Story = { args: { supportingText: 'Buzz when your rest is over' } };

export const WithIcon: Story = { args: { icon: NotificationsIcon, systemImage: 'bell' } };

export const Disabled: Story = { args: { disabled: true } };

export const Focused: Story = { args: { focus: true } };
