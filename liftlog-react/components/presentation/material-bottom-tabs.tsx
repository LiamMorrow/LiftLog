import { Tabs } from 'expo-router';
import { CommonActions } from '@react-navigation/core';
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { PropsWithChildren, useEffect } from 'react';
import {
  Appbar,
  BottomNavigation,
  BottomNavigationProps,
} from 'react-native-paper';
import { useScroll } from '@/hooks/useScollListener';
import { Animated, useAnimatedValue } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

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
  const { colors } = useAppTheme();

  useEffect(() => {
    Animated.timing(scrollColor, {
      toValue: isScrolled ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isScrolled, scrollColor]);

  return (
    <Animated.View
      style={{
        backgroundColor: scrollColor.interpolate({
          inputRange: [0, 1],
          outputRange: [colors.surface, colors.surfaceContainer],
        }),
      }}
    >
      <Appbar.Header
        mode={props.navigation.canGoBack() ? 'small' : 'center-aligned'}
        style={{
          backgroundColor: 'transparent',
        }}
      >
        {props.navigation.canGoBack() ? (
          <Appbar.BackAction onPress={props.navigation.goBack} />
        ) : null}
        <Appbar.Content title={props.options.title} />
        <Appbar.Action icon="dots-vertical" onPress={() => {}} />
      </Appbar.Header>
    </Animated.View>
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
          navigationState={{
            ...state,
            routes: state.routes.filter((r) =>
              ['(session)/index', 'settings'].includes(r.name),
            ),
          }}
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
