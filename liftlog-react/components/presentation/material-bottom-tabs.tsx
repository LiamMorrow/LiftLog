import { Tabs } from 'expo-router';
import { CommonActions } from '@react-navigation/core';
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { PropsWithChildren } from 'react';
import {
  Appbar,
  BottomNavigation,
  BottomNavigationProps,
} from 'react-native-paper';
import { useScroll } from '@/hooks/useScollListener';
import { useAnimatedValue } from 'react-native';

export type MaterialBottomTabsProps = PropsWithChildren<
  Omit<
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

function Header(props: BottomTabHeaderProps) {
  const isScrolled = useScroll().isScrolled;
  const scrollColor = useAnimatedValue(0);

  return (
    <Appbar.Header
      mode={props.navigation.canGoBack() ? 'small' : 'center-aligned'}
    >
      {props.navigation.canGoBack() ? (
        <Appbar.BackAction onPress={props.navigation.goBack} />
      ) : null}
      <Appbar.Content title={props.options.title} />
      <Appbar.Action icon="dots-vertical" onPress={() => {}} />
    </Appbar.Header>
  );
}

export function MaterialBottomTabs({
  children,
  ...props
}: MaterialBottomTabsProps) {
  return (
    <Tabs
      screenOptions={{
        header: (props) => {
          return <Header {...props} />;
        },
      }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          {...props}
          navigationState={state}
          safeAreaInsets={insets}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              preventDefault();
            } else {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
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
      )}
    >
      {children}
    </Tabs>
  );
}

MaterialBottomTabs.Screen = Tabs.Screen;
