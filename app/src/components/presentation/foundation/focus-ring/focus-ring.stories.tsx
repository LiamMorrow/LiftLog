import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import FocusRing from '@/components/presentation/foundation/focus-ring';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { useAppTheme } from '@/hooks/useAppTheme';

function Swatch() {
  const { colors } = useAppTheme();
  return <View style={{ width: 48, height: 48, borderRadius: 48, backgroundColor: colors.primary }} />;
}

function SelectableSwatches() {
  const [selected, setSelected] = useState(0);
  return (
    <View style={{ flexDirection: 'row', gap: 16, padding: 8 }}>
      {[0, 1, 2].map((index) => (
        <FocusRing key={index} isSelected={selected === index}>
          <TouchableRipple onPress={() => setSelected(index)} style={{ borderRadius: 48, overflow: 'hidden' }}>
            <Swatch />
          </TouchableRipple>
        </FocusRing>
      ))}
    </View>
  );
}

const meta = {
  title: 'Foundation/FocusRing',
  component: FocusRing,
  args: { isSelected: true, children: <Swatch /> },
  render: (args) => (
    <View style={{ padding: 8, alignItems: 'flex-start' }}>
      <FocusRing {...args} />
    </View>
  ),
} satisfies Meta<typeof FocusRing>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Selected: Story = {};

export const Unselected: Story = { args: { isSelected: false } };

export const SelectionMoves: Story = { render: () => <SelectableSwatches /> };
