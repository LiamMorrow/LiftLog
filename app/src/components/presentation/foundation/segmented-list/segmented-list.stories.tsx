import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import {
  SegmentedGroup,
  SegmentedList,
  SegmentListFormElement,
} from '@/components/presentation/foundation/segmented-list';

const meta = {
  title: 'Foundation/SegmentedList',
  component: SegmentedGroup,
  args: { children: null },
} satisfies Meta<typeof SegmentedGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Group: Story = {
  render: () => (
    <SegmentedGroup>
      <SegmentListFormElement label="Bench press" right="80 kg" />
      <SegmentListFormElement label="Squat" right="120 kg" />
      <SegmentListFormElement label="Deadlift" right="140 kg" />
    </SegmentedGroup>
  ),
};

export const SingleItem: Story = {
  render: () => (
    <SegmentedGroup>
      <SegmentListFormElement label="Bench press" right="80 kg" />
    </SegmentedGroup>
  ),
};

export const FromItems: Story = {
  render: () => (
    <SegmentedList
      items={['Push', 'Pull', 'Legs']}
      renderItem={(item) => <SegmentListFormElement label={item} onPress={fn()} />}
    />
  ),
};

export const Scrollable: Story = {
  render: () => (
    <SegmentedList
      scrollable
      items={['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full body']}
      renderItem={(item) => <SegmentListFormElement label={item} onPress={fn()} />}
    />
  ),
};

export const FormElement: Story = {
  render: () => (
    <SegmentedGroup>
      <SegmentListFormElement label="Plain" />
      <SegmentListFormElement label="Pressable" onPress={fn()} />
      <SegmentListFormElement label="With supporting text" supportingText="Explains what this row does" />
      <SegmentListFormElement label="With right text" right="Value" />
      <SegmentListFormElement label="Destructive" destructive onPress={fn()} />
    </SegmentedGroup>
  ),
};
