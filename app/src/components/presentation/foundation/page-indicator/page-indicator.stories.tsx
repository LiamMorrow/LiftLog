import type { Meta, StoryObj } from '@storybook/react-native';
import { useEffect } from 'react';
import { Animated, useAnimatedValue } from 'react-native';
import { PageIndicator } from '@/components/presentation/foundation/page-indicator';
import { useAppTheme } from '@/hooks/useAppTheme';

function AnimatedIndicator({ count, page }: { count: number; page: number }) {
  const { colors } = useAppTheme();
  const progress = useAnimatedValue(page);
  useEffect(() => {
    Animated.timing(progress, { toValue: page, duration: 250, useNativeDriver: false }).start();
  }, [page, progress]);
  return <PageIndicator count={count} progress={progress} color={colors.onSurfaceVariant} />;
}

const meta = {
  title: 'Foundation/PageIndicator',
  component: AnimatedIndicator,
  args: { count: 4, page: 0 },
  argTypes: { page: { control: { type: 'number', min: 0, max: 9, step: 1 } } },
} satisfies Meta<typeof AnimatedIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FirstPage: Story = {};

export const LastPage: Story = { args: { page: 3 } };

export const SinglePageHidden: Story = { args: { count: 1 } };
