import { Tabs, useRouter } from 'expo-router';
import { CommonActions } from '@react-navigation/core';
import { PropsWithChildren } from 'react';
import { BottomNavigation, BottomNavigationProps } from 'react-native-paper';
import { Platform } from 'react-native';
import { useAppSelector } from '@/store';

export type MaterialBottomTabsProps = PropsWithChildren<
  Omit<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BottomNavigationProps<any>,
    | 'navigationState'
    | 'safeAreaInsets'
    | 'onTabPress'
    | 'renderIcon'
    | 'getLabelText'
    | 'onIndexChange'
    | 'renderScene'
  >
>;

export function MaterialBottomTabs({
  children,
  ...props
}: MaterialBottomTabsProps) {
  const showFeed = useAppSelector((x) => x.settings.showFeed);
  const { dismissTo } = useRouter();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'web' ? 'none' : 'shift',
      }}
      tabBar={({ navigation, state, descriptors, insets }) => {
        const routes = state.routes.filter(
          (x) => showFeed || !x.name.includes('feed'),
        );
        return (
          <BottomNavigation.Bar
            testID="nav"
            {...props}
            navigationState={{
              ...state,
              routes: routes,
            }}
            safeAreaInsets={insets}
            labeled
            onTabPress={({ route, preventDefault }) => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (event.defaultPrevented) {
                preventDefault();
                return;
              }

              // Emulates the behaviour of popping to the top of the stack
              // when tapping the tab of a stack you're already on
              // on web
              const shouldPopToTop =
                Platform.OS === 'web' &&
                state.index ===
                  state.routes.findIndex((r) => r.key === route.key);

              if (shouldPopToTop) {
                navigation.navigate(route.name, route.params);
                dismissTo(('/' + route.name) as '/');
              } else {
                // Not focused: navigate normally
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                navigation.dispatch({
                  ...CommonActions.navigate(route.name, route.params),
                  target: state.key, // target the tab navigator
                });
              }
            }}
            getTestID={({ route }) => {
              const { options } = descriptors[route.key];
              return options.tabBarButtonTestID;
            }}
            getBadge={({ route }) => {
              const { options } = descriptors[route.key];
              return options.tabBarBadge;
            }}
            renderIcon={({ route, focused, color }) => {
              const { options } = descriptors[route.key];
              if (options.tabBarIcon) {
                return options.tabBarIcon({ focused, color, size: 24 });
              }

              return null;
            }}
            getLabelText={({ route }) => {
              const { options } = descriptors[route.key];
              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                    ? options.title
                    : 'title' in route
                      ? route.title
                      : route.name;

              return String(label);
            }}
          />
        );
      }}
    >
      {children}
    </Tabs>
  );
}

MaterialBottomTabs.Screen = Tabs.Screen;
