import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { GlassBackground } from '@/components/presentation/foundation/glass-background';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = React.ComponentProps<typeof GlassBackground>;

function OverContent(props: Props) {
  const { colors } = useAppTheme();
  return (
    <View style={{ height: 160, justifyContent: 'center' }}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 80, backgroundColor: colors.primary }} />
      <View style={{ alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 16 }}>
        <GlassBackground {...props} />
        <AppText variant="titleMedium">Floating label</AppText>
      </View>
    </View>
  );
}

const meta = {
  title: 'Foundation/GlassBackground',
  component: GlassBackground,
  args: { radius: 24, color: '#FFFFFFCC', glassEffectStyle: 'regular' },
  argTypes: { glassEffectStyle: { control: 'radio', options: ['regular', 'clear'] } },
  render: (args) => <OverContent {...args} />,
} satisfies Meta<typeof GlassBackground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Regular: Story = {};

export const Clear: Story = { args: { glassEffectStyle: 'clear' } };
