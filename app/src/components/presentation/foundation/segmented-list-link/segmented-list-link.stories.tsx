import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListLink } from '@/components/presentation/foundation/segmented-list-link';
import SettingsIcon from '@expo/material-symbols/settings.xml';

const meta = {
  title: 'Foundation/SegmentedListLink',
  component: SegmentedListLink,
  args: { label: 'Backends', onPress: fn() },
  render: (args) => (
    <SegmentedGroup>
      <SegmentedListLink {...args} />
    </SegmentedGroup>
  ),
} satisfies Meta<typeof SegmentedListLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSupportingText: Story = { args: { supportingText: 'Choose where your data lives' } };

export const WithIcon: Story = { args: { icon: SettingsIcon, systemImage: 'gearshape' } };
