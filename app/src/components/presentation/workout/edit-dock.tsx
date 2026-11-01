import { NativeButton } from '@/components/presentation/foundation/native-button';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import {
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
import { Animated, Dimensions, Easing, Keyboard, useAnimatedValue, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { AppText } from '@/components/presentation/foundation/app-text';
import { FloatingPane } from '@/components/presentation/workout/floating-pane';
import { KeyboardDoneButtonContext } from '@/components/presentation/foundation/editors/number-inputs';

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
  const host = useRef<View>(null);
  const [distanceToScreenBottom, setDistanceToScreenBottom] = useState(0);
  const isOpen = entry !== undefined;

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
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  const store = useContext(EditDockContext);
  const id = useId();
  const close = () => {
    Keyboard.dismiss();
    props.onClose();
  };
  const pane = props.open ? (
    <EditPane title={props.title} subtitle={props.subtitle} headerAction={props.headerAction} onDone={close}>
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
  headerAction: ReactNode;
  onDone: () => void;
  children: ReactNode;
}) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  return (
    <FloatingPane
      testID="edit-dock"
      style={{ marginHorizontal: spacing.pageHorizontalMargin, marginBottom: spacing[3] }}
      contentStyle={{ paddingVertical: spacing[4], paddingLeft: spacing[4], paddingRight: spacing[4], gap: spacing[4] }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
        <View style={{ flex: 1 }}>
          <AppText variant="titleMedium" numberOfLines={1}>
            {props.title}
          </AppText>
          {props.subtitle ? (
            <AppText variant="bodySmall" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>
              {props.subtitle}
            </AppText>
          ) : undefined}
        </View>
        {props.headerAction}
        <NativeButton testID="edit-dock-done" label={t('generic.done.button')} onPress={props.onDone} />
      </View>
      <KeyboardDoneButtonContext value={false}>{props.children}</KeyboardDoneButtonContext>
    </FloatingPane>
  );
}
