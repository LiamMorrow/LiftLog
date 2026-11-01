import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { floatingShadowStyle } from '@/components/presentation/foundation/floating-shadow';
import { useAppTheme } from '@/hooks/useAppTheme';

function FloatingSurface() {
  const { colors } = useAppTheme();
  return (
    <View style={[floatingShadowStyle, { alignSelf: 'center', marginTop: 32 }]}>
      <View style={{ borderRadius: 24, paddingHorizontal: 24, paddingVertical: 16, backgroundColor: colors.surface }}>
        <AppText variant="titleMedium">Rest 1:30</AppText>
      </View>
    </View>
  );
}

const meta = {
  title: 'Foundation/FloatingShadow',
  component: FloatingSurface,
} satisfies Meta<typeof FloatingSurface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Style: Story = {};
