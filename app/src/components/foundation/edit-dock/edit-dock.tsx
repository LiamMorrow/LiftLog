import { NativeButton } from '@/components/foundation/native-button';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import {
  Children,
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  useAnimatedValue,
  useWindowDimensions,
  View,
  type ViewInstance,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
  AndroidSoftInputModes,
  KeyboardController,
  useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller';
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/foundation/app-text';
import { KeyboardDoneButtonContext } from '@/components/foundation/editors/number-inputs';

interface DockEntry {
  id: string;
  pane: ReactNode;
  close: () => void;
}

function createEditDockStore() {
  let entry: DockEntry | undefined;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    get: () => entry,
    show: (next: DockEntry) => {
      const previous = entry;
      entry = next;
      if (previous && previous.id !== next.id) {
        previous.close();
      }
      emit();
    },
    hide: (id: string) => {
      if (entry?.id === id) {
        entry = undefined;
        emit();
      }
    },
  };
}

type EditDockStore = ReturnType<typeof createEditDockStore>;

const EditDockContext = createContext<EditDockStore | undefined>(undefined);

export function EditDockProvider(props: { children: ReactNode }) {
  const [store] = useState(createEditDockStore);
  const entry = useSyncExternalStore(store.subscribe, store.get);
  return (
    <EditDockContext value={store}>
      <View style={{ flex: 1 }}>
        <View
          style={{ flex: 1 }}
          pointerEvents={entry ? 'none' : 'auto'}
          importantForAccessibility={entry ? 'no-hide-descendants' : 'auto'}
          accessibilityElementsHidden={!!entry}
        >
          {props.children}
        </View>
        <EditDockOverlay />
      </View>
    </EditDockContext>
  );
}

export function EditDockHost(props: { children: ReactNode }) {
  const store = useContext(EditDockContext);
  const entry = useSyncExternalStore(store?.subscribe ?? noSubscribe, () => store?.get());
  return <View style={{ opacity: entry ? 0 : 1 }}>{props.children}</View>;
}

function EditDockOverlay() {
  const store = useContext(EditDockContext);
  const entry = useSyncExternalStore(store?.subscribe ?? noSubscribe, () => store?.get());
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const host = useRef<ViewInstance>(null);
  const [distanceToScreenBottom, setDistanceToScreenBottom] = useState(0);
  const isOpen = entry !== undefined;

  useFocusEffect(disableKeyboardWindowPan);

  useFocusEffect(() => {
    if (!entry) {
      return;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      Keyboard.dismiss();
      entry.close();
      return true;
    });
    return () => subscription.remove();
  });

  useEffect(() => {
    if (!entry || Platform.OS !== 'android') {
      return;
    }
    const subscription = Keyboard.addListener('keyboardDidHide', entry.close);
    return () => subscription.remove();
  }, [entry]);

  // The keyboard's height counts from the bottom of the screen, which can sit below the page: under the safe
  // area on iOS, under the tab and navigation bars on Android.
  const measureDistanceToScreenBottom = () =>
    host.current?.measureInWindow((_x, y, _width, height) =>
      setDistanceToScreenBottom(Math.max(0, Dimensions.get('screen').height - (y + height))),
    );

  const keyboard = useReanimatedKeyboardAnimation();
  const insets = useSafeAreaInsets();
  const restingLift = Platform.OS === 'ios' ? insets.bottom : 0;
  const liftAboveKeyboard = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.min(-restingLift, keyboard.height.value + distanceToScreenBottom) }],
  }));

  const progress = useAnimatedValue(0);
  const [paneHeight, setPaneHeight] = useState(() => Dimensions.get('window').height);
  const [previousEntry, setPreviousEntry] = useState(entry);
  const [closingPane, setClosingPane] = useState<ReactNode>();
  if (entry !== previousEntry) {
    setPreviousEntry(entry);
    setClosingPane(entry ? undefined : previousEntry?.pane);
  }
  const pane = entry?.pane ?? closingPane;

  useEffect(() => {
    if (isOpen) {
      progress.setValue(0);
    }
    const animation = Animated.timing(progress, {
      toValue: isOpen ? 1 : 0,
      duration: isOpen ? 250 : 200,
      easing: isOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    const frame = requestAnimationFrame(() => {
      animation.start(({ finished }) => {
        if (finished && !isOpen) {
          setClosingPane(undefined);
        }
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      animation.stop();
    };
  }, [isOpen, progress]);

  return (
    <View
      ref={host}
      onLayout={measureDistanceToScreenBottom}
      style={[StyleSheet.absoluteFill, { pointerEvents: isOpen ? 'box-none' : 'none' }]}
      accessibilityViewIsModal={isOpen}
      onAccessibilityEscape={() => {
        Keyboard.dismiss();
        entry?.close();
      }}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: progress, backgroundColor: colors.scrim + '33' }]}>
        <Pressable
          testID="edit-dock-dismiss"
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel={t('generic.close.button')}
          onPress={() => {
            Keyboard.dismiss();
            entry?.close();
          }}
        />
      </Animated.View>
      <Reanimated.View
        style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, pointerEvents: 'box-none' }, liftAboveKeyboard]}
      >
        {pane ? (
          <Animated.View
            onLayout={(e) => setPaneHeight(e.nativeEvent.layout.height)}
            style={{
              pointerEvents: isOpen ? 'box-none' : 'none',
              opacity: progress,
              transform: [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [paneHeight + restingLift + distanceToScreenBottom, 0],
                  }),
                },
              ],
            }}
          >
            {pane}
          </Animated.View>
        ) : undefined}
      </Reanimated.View>
    </View>
  );
}

const noSubscribe = () => () => {};

function disableKeyboardWindowPan() {
  KeyboardController.setInputMode(AndroidSoftInputModes.SOFT_INPUT_ADJUST_NOTHING);
  return () => KeyboardController.setDefaultMode();
}

export function DockedEditor(props: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  actions?: (close: () => void) => ReactNode;
  children: ReactNode;
}) {
  const store = useContext(EditDockContext);
  const id = useId();
  const close = () => {
    Keyboard.dismiss();
    props.onClose();
  };
  const pane = props.open ? (
    <EditPane title={props.title} subtitle={props.subtitle} actions={props.actions?.(close)} onDone={close}>
      {props.children}
    </EditPane>
  ) : undefined;

  useLayoutEffect(() => {
    if (pane) {
      store?.show({ id, pane, close: props.onClose });
    } else {
      store?.hide(id);
    }
  });
  useEffect(() => () => store?.hide(id), [store, id]);

  return null;
}

function EditPane(props: {
  title: string;
  subtitle: string | undefined;
  actions: ReactNode;
  onDone: () => void;
  children: ReactNode;
}) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const buttons = (
    <View
      style={{
        flexDirection: isLandscape ? 'column' : 'row',
        alignItems: isLandscape ? 'flex-end' : 'center',
        justifyContent: 'flex-end',
        gap: spacing[2],
      }}
    >
      {props.actions}
      <NativeButton testID="edit-dock-done" label={t('generic.done.button')} onPress={props.onDone} />
    </View>
  );
  const editors = isLandscape ? (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[4] }}>
      {Children.toArray(props.children).map((child, index) => (
        <View key={index} style={{ flex: 1 }}>
          {child}
        </View>
      ))}
    </View>
  ) : (
    props.children
  );
  const pane = (
    <View
      testID="edit-dock"
      style={{
        alignSelf: 'stretch',
        flex: isLandscape ? 1 : undefined,
        backgroundColor: colors.surfaceContainer,
        borderTopLeftRadius: spacing[4],
        borderTopRightRadius: spacing[4],
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: colors.outlineVariant,
        padding: spacing[4],
        gap: spacing[2],
      }}
    >
      {Platform.OS === 'ios' ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -spacing[8],
            height: spacing[8],
            backgroundColor: colors.surfaceContainer,
          }}
        />
      ) : undefined}
      <View>
        <AppText variant="titleMedium" numberOfLines={1}>
          {props.title}
        </AppText>
        {props.subtitle ? (
          <AppText variant="bodySmall" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>
            {props.subtitle}
          </AppText>
        ) : undefined}
      </View>
      <KeyboardDoneButtonContext value={false}>{editors}</KeyboardDoneButtonContext>
      {buttons}
    </View>
  );

  return (
    <View
      style={{
        flexDirection: isLandscape ? 'row' : 'column',
        alignItems: isLandscape ? 'flex-end' : undefined,
        gap: spacing[2],
      }}
    >
      {pane}
    </View>
  );
}
