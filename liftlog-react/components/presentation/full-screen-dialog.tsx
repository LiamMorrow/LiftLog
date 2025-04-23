import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import { usePreventNavigate } from '@/hooks/usePreventNavigate';
import { ReactNode } from 'react';
import { Animated, Text, useAnimatedValue, View } from 'react-native';
import { Button, IconButton, Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const scrollAnimation = useAnimatedValue(0);
  const { colors } = useAppTheme();
  const { top, bottom } = useSafeAreaInsets();

  usePreventNavigate(open, onClose);

  return (
    <Portal>
      {open ? (
        <View
          style={{
            flex: 1,
          }}
        >
          <Animated.View
            style={{
              backgroundColor: scrollAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [colors.surface, colors.surfaceContainer],
              }),
              paddingTop: top,
            }}
          >
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
            setIsScrolled={(scrolled) =>
              Animated.timing(scrollAnimation, {
                toValue: scrolled ? 1 : 0,
                useNativeDriver: true,
                duration: 100,
              }).start()
            }
          >
            {children}
            <View style={{ height: bottom, width: '100%' }}></View>
          </FullHeightScrollView>
        </View>
      ) : undefined}
    </Portal>
  );
}
