import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import { useAppTheme, spacing } from '@/hooks/useAppTheme';
import { usePreventNavigate } from '@/hooks/usePreventNavigate';
import { ReactNode, useEffect } from 'react';
import { View } from 'react-native';
import { Portal, Text } from 'react-native-paper';
import Button from '@/components/presentation/gesture-wrappers/button';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  Easing,
  FadeInDown,
  FadeOutDown,
} from 'react-native-reanimated';
import { ScrollProvider, useScroll } from '@/hooks/useScrollListener';

interface FullScreenDialogProps {
  title: string;
  action?: string;
  open: boolean;
  children: ReactNode;
  noScroll?: boolean;
  onAction?: () => void;
  onClose: () => void;
}

export default function FullScreenDialog(props: FullScreenDialogProps) {
  const { action, open, onAction, onClose, title, children } = props;

  const { bottom } = useSafeAreaInsets();
  const { colors } = useAppTheme();

  usePreventNavigate(open, onClose);

  return (
    <Portal>
      {open ? (
        <ScrollProvider>
          <Animated.View
            entering={FadeInDown.duration(150).easing(
              Easing.inOut(Easing.quad),
            )}
            exiting={FadeOutDown.duration(150).easing(
              Easing.inOut(Easing.quad),
            )}
            testID="fullscreen-dialog"
            style={{
              flex: 1,
            }}
          >
            <Header
              onClose={onClose}
              action={action!}
              onAction={onAction!}
              title={title}
            />
            {props.noScroll ? (
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  paddingHorizontal: spacing.pageHorizontalMargin,
                }}
              >
                {children}
                <View style={{ height: bottom, width: '100%' }}></View>
              </View>
            ) : (
              <FullHeightScrollView
                scrollStyle={{
                  padding: spacing.pageHorizontalMargin,
                }}
              >
                {children}
                <View style={{ height: bottom, width: '100%' }}></View>
              </FullHeightScrollView>
            )}
          </Animated.View>
        </ScrollProvider>
      ) : undefined}
    </Portal>
  );
}

function Header({
  onClose,
  title,
  action,
  onAction,
}: Pick<FullScreenDialogProps, 'action' | 'onAction' | 'onClose' | 'title'>) {
  const scrollAnimation = useSharedValue(0);
  const { colors } = useAppTheme();
  const { top } = useSafeAreaInsets();
  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      scrollAnimation.value,
      [0, 1],
      [colors.surface, colors.surfaceContainer],
    ),
    paddingTop: top,
  }));
  const { isScrolled } = useScroll();

  useEffect(() => {
    scrollAnimation.set(
      withTiming(isScrolled ? 1 : 0, {
        duration: 100,
      }),
    );
  }, [isScrolled, scrollAnimation]);

  return (
    <Animated.View style={backgroundStyle}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[2],
          paddingVertical: spacing[4],
          paddingRight: spacing[2],
        }}
      >
        <IconButton testID="dialog-close" icon={'close'} onPress={onClose} />
        <Text
          style={{
            marginRight: 'auto',
            flexShrink: 1, //
          }}
          variant="headlineSmall"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        {action && onAction ? (
          <Button testID="dialog-action" onPress={onAction}>
            {action}
          </Button>
        ) : null}
      </View>
    </Animated.View>
  );
}
