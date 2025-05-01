import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import { usePreventNavigate } from '@/hooks/usePreventNavigate';
import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Button, IconButton, Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

interface FullScreenDialogProps {
  title: string;
  action: string;
  open: boolean;
  children: ReactNode;
  onAction?: () => void;
  onClose: () => void;
}

export default function FullScreenDialog(props: FullScreenDialogProps) {
  const { action, open, onAction, onClose, title, children } = props;
  const scrollAnimation = useSharedValue(0);
  const { colors } = useAppTheme();
  const { top, bottom } = useSafeAreaInsets();

  usePreventNavigate(open, onClose);

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      scrollAnimation.value,
      [0, 1],
      [colors.surface, colors.surfaceContainer],
    ),
    paddingTop: top,
  }));

  return (
    <Portal>
      {open ? (
        <View
          style={{
            flex: 1,
          }}
        >
          <Animated.View style={backgroundStyle}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: spacing[2],
                padding: spacing[4],
              }}
            >
              <IconButton icon={'close'} onPress={onClose} />
              <Text
                style={{
                  marginRight: 'auto',
                  ...font['text-2xl'],
                  color: colors.onSurface,
                }}
              >
                {title}
              </Text>
              {action && onAction ? (
                <Button onPress={onAction}>{action}</Button>
              ) : null}
            </View>
          </Animated.View>
          <FullHeightScrollView
            scrollStyle={{
              padding: spacing[2],
            }}
            setIsScrolled={(scrolled) => {
              scrollAnimation.set(
                withTiming(scrolled ? 1 : 0, {
                  duration: 100,
                }),
              );
            }}
          >
            {children}
            <View style={{ height: bottom, width: '100%' }}></View>
          </FullHeightScrollView>
        </View>
      ) : undefined}
    </Portal>
  );
}
