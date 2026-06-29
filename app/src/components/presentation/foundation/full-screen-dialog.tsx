import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { useAppTheme, spacing } from '@/hooks/useAppTheme';
import { usePreventNavigate } from '@/hooks/usePreventNavigate';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Portal, Text } from 'react-native-paper';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollProvider, useScroll } from '@/hooks/useScrollListener';

const DIALOG_DURATION = 150;

interface FullScreenDialogProps {
  title: string;
  action?: string;
  open: boolean;
  children: ReactNode;
  noScroll?: boolean;
  avoidKeyboard?: boolean;
  onAction?: () => void;
  onClose: () => void;
}

export default function FullScreenDialog(props: FullScreenDialogProps) {
  const { action, open, onAction, onClose, title, children } = props;
  const { bottom } = useSafeAreaInsets();
  const { colors } = useAppTheme();

  // Keep children mounted during exit animation
  const [mounted, setMounted] = useState(open);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Reset first so the enter always animates from 0 regardless of prior state
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: DIALOG_DURATION,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: DIALOG_DURATION,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [open, anim]);

  usePreventNavigate(open, onClose);

  if (!mounted) return null;

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (
    <Portal>
      <ScrollProvider>
        <Animated.View
          testID="fullscreen-dialog"
          style={{
            flex: 1,
            opacity: anim,
            transform: [{ translateY }],
          }}
        >
          <Header onClose={onClose} action={action} onAction={onAction} title={title} />
          {props.noScroll ? (
            <View
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                paddingHorizontal: spacing.pageHorizontalMargin,
              }}
            >
              {children}
              <View style={{ height: bottom, width: '100%' }} />
            </View>
          ) : (
            <FullHeightScrollView
              avoidKeyboard={props.avoidKeyboard}
              scrollStyle={{ padding: spacing.pageHorizontalMargin }}
            >
              {children}
              <View style={{ height: bottom, width: '100%' }} />
            </FullHeightScrollView>
          )}
        </Animated.View>
      </ScrollProvider>
    </Portal>
  );
}

function Header({
  onClose,
  title,
  action,
  onAction,
}: Pick<FullScreenDialogProps, 'action' | 'onAction' | 'onClose' | 'title'>) {
  const { colors } = useAppTheme();
  const { top } = useSafeAreaInsets();
  const { isScrolled } = useScroll();

  const scrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scrollAnim, {
      toValue: isScrolled ? 1 : 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [isScrolled, scrollAnim]);

  const backgroundColor = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surface, colors.surfaceContainer],
  });

  return (
    <Animated.View style={{ backgroundColor, paddingTop: top }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[2],
          paddingVertical: spacing[4],
          paddingRight: spacing[2],
        }}
      >
        <IconButton testID="dialog-close" icon="close" onPress={onClose} />
        <Text
          style={{ marginRight: 'auto', flexShrink: 1 }}
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
