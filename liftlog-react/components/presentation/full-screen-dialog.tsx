import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useNavigation } from 'expo-router';
import { ReactNode, useEffect } from 'react';
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
  // Navigation
  const navigation = useNavigation();
  const scrollAnimation = useAnimatedValue(0);
  const { colors, spacing, font } = useAppTheme();
  const { top, bottom } = useSafeAreaInsets();

  // Effect
  useEffect(() => {
    const listener = navigation.addListener('beforeRemove', (e) => {
      if (!open) {
        return;
      }
      e.preventDefault();
      onClose();
    });

    return () => {
      navigation.removeListener('beforeRemove', listener);
    };
  }, [navigation, onClose, open]);

  return (
    <Portal>
      <View
        style={
          open
            ? {
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }
            : {
                opacity: 0,
                top: 0,
                left: 0,
                width: 0,
                height: 0,
              }
        }
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
            {action ? <Button onPress={onAction}>{action}</Button> : null}
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
    </Portal>
  );
}
