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
  useAnimatedValue,
  useWindowDimensions,
  View,
  type ViewInstance,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { AppText } from '@/components/foundation/app-text';
import { FloatingPane } from '@/components/foundation/floating-pane';
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
  return <EditDockContext value={store}>{props.children}</EditDockContext>;
}

/**
 * Shows the open editor in place of its children. The children stay laid out underneath, so the space the
 * page reserves for them never changes and the content behind does not reflow.
 */
export function EditDockHost(props: { children: ReactNode }) {
  const store = useContext(EditDockContext);
  const entry = useSyncExternalStore(store?.subscribe ?? noSubscribe, () => store?.get());
  const host = useRef<ViewInstance>(null);
  const [distanceToScreenBottom, setDistanceToScreenBottom] = useState(0);
  const isOpen = entry !== undefined;

  useFocusEffect(() => {
    if (!entry) {
      return;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      entry.close();
      return true;
    });
    return () => subscription.remove();
  });

  // The keyboard's height counts from the bottom of the screen, which can sit below the page: under the safe
  // area on iOS, under the tab and navigation bars on Android.
  const measureDistanceToScreenBottom = () =>
    host.current?.measureInWindow((_x, y, _width, height) =>
      setDistanceToScreenBottom(Math.max(0, Dimensions.get('screen').height - (y + height))),
    );

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
    const animation = Animated.timing(progress, {
      toValue: isOpen ? 1 : 0,
      duration: isOpen ? 250 : 200,
      easing: isOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished && !isOpen) {
        setClosingPane(undefined);
      }
    });
    return () => animation.stop();
  }, [isOpen, progress]);

  return (
    <View ref={host} onLayout={measureDistanceToScreenBottom} style={{ pointerEvents: 'box-none' }}>
      <Animated.View
        style={{
          pointerEvents: isOpen ? 'none' : 'box-none',
          opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        }}
        importantForAccessibility={isOpen ? 'no-hide-descendants' : 'auto'}
        accessibilityElementsHidden={isOpen}
      >
        {props.children}
      </Animated.View>
      <KeyboardStickyView
        offset={{ opened: distanceToScreenBottom }}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, pointerEvents: 'box-none' }}
      >
        {pane ? (
          <Animated.View
            onLayout={(e) => setPaneHeight(e.nativeEvent.layout.height)}
            style={{
              pointerEvents: isOpen ? 'box-none' : 'none',
              transform: [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [paneHeight + distanceToScreenBottom, 0],
                  }),
                },
              ],
            }}
          >
            {pane}
          </Animated.View>
        ) : undefined}
      </KeyboardStickyView>
    </View>
  );
}

const noSubscribe = () => () => {};

/** Edits a value from the workout in the dock at the bottom of the page, while the workout stays in view. */
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
      <NativeButton floating testID="edit-dock-done" label={t('generic.done.button')} onPress={props.onDone} />
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
    <FloatingPane
      testID="edit-dock"
      style={{ marginTop: 0, alignSelf: 'stretch', flex: isLandscape ? 1 : undefined }}
      contentStyle={{
        paddingVertical: spacing[4],
        paddingLeft: spacing[4],
        paddingRight: spacing[4],
        gap: spacing[4],
      }}
    >
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
    </FloatingPane>
  );

  return (
    <View
      style={{
        flexDirection: isLandscape ? 'row' : 'column',
        alignItems: isLandscape ? 'flex-end' : undefined,
        marginHorizontal: spacing.pageHorizontalMargin,
        marginBottom: spacing[3],
        gap: spacing[2],
      }}
    >
      {isLandscape ? undefined : buttons}
      {pane}
      {isLandscape ? buttons : undefined}
    </View>
  );
}
