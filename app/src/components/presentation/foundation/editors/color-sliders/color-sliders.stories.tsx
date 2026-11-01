import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { fn } from 'storybook/test';
import { AppText } from '@/components/presentation/foundation/app-text';
import { ColorSliders } from '@/components/presentation/foundation/editors/color-sliders';

type Props = React.ComponentProps<typeof ColorSliders>;

function StatefulSliders({ value, onChange }: Props) {
  const [color, setColor] = useState(value);
  return (
    <View style={{ gap: 16 }}>
      <ColorSliders
        value={color}
        onChange={(next) => {
          setColor(next);
          onChange(next);
        }}
      />
      <View style={{ height: 48, borderRadius: 12, backgroundColor: color }} />
      <AppText>{color}</AppText>
    </View>
  );
}

const meta = {
  title: 'Foundation/Editors/ColorSliders',
  component: ColorSliders,
  args: { value: '#AA00AA', onChange: fn() },
  render: (args) => <StatefulSliders {...args} />,
} satisfies Meta<typeof ColorSliders>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
