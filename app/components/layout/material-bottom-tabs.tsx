import { Tabs, useRouter } from 'expo-router';
import { CommonActions } from '@react-navigation/core';
import { PropsWithChildren } from 'react';
import { BottomNavigationProps, Badge } from 'react-native-paper';
import { Platform, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector } from '@/store';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';

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
  const { colors } = useAppTheme();
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

        const wrapperHeight = insets.bottom + 92;
        return (
          <View
            style={{
              height: wrapperHeight,
            }}
            pointerEvents="box-none"
          >
            <LinearGradient
              pointerEvents="none"
              colors={[
                `${colors.scrim}00`,
                `${colors.scrim}12`,
                `${colors.scrim}38`,
              ]}
              locations={[0, 0.45, 1]}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: wrapperHeight,
              }}
            />
            <View
              testID="nav"
              style={{
                position: 'absolute',
                left: spacing.pageHorizontalMargin,
                right: spacing.pageHorizontalMargin,
                bottom: Math.max(insets.bottom, spacing[2]),
                flexDirection: 'row',
                alignItems: 'stretch',
                gap: spacing[1],
                padding: spacing[1],
                borderRadius: 32,
                backgroundColor: colors.surfaceContainerHighest,
                borderWidth: 1,
                borderColor: `${colors.outlineVariant}66`,
                shadowColor: colors.scrim,
                shadowOpacity: 0.28,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 10 },
                elevation: 18,
              }}
            >
              {routes.map((route) => {
                const routeIndex = state.routes.findIndex(
                  (candidate) => candidate.key === route.key,
                );
                const focused = state.index === routeIndex;
                const { options } = descriptors[route.key];
                const badge = options.tabBarBadge;
                const label =
                  options.tabBarLabel !== undefined
                    ? options.tabBarLabel
                    : options.title !== undefined
                      ? options.title
                      : 'title' in route
                        ? route.title
                        : route.name;

                return (
                  <Pressable
                    key={route.key}
                    testID={options.tabBarButtonTestID}
                    accessibilityRole="tab"
                    accessibilityState={focused ? { selected: true } : {}}
                    accessibilityLabel={options.tabBarAccessibilityLabel}
                    onLongPress={() => {
                      navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                      });
                    }}
                    onPress={() => {
                      const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                      });

                      if (event.defaultPrevented) {
                        return;
                      }

                      const shouldPopToTop =
                        Platform.OS === 'web' && state.index === routeIndex;

                      if (shouldPopToTop) {
                        navigation.navigate(route.name, route.params);
                        dismissTo(('/' + route.name) as '/');
                      } else {
                        // Not focused: navigate normally
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        navigation.dispatch({
                          ...CommonActions.navigate(route.name, route.params),
                          target: state.key,
                        });
                      }
                    }}
                    style={({ hovered, pressed }) => ({
                      flex: 1,
                      borderRadius: 26,
                      minHeight: 62,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: spacing[2],
                      paddingVertical: spacing[2],
                      backgroundColor: focused
                        ? colors.primaryContainer
                        : hovered || pressed
                          ? `${colors.onSurface}10`
                          : 'transparent',
                      opacity: pressed ? 0.92 : 1,
                    })}
                  >
                    {({ hovered, pressed }) => {
                      const contentColor = focused
                        ? colors.onPrimaryContainer
                        : hovered || pressed
                          ? colors.onSurface
                          : colors.onSurfaceVariant;
                      return (
                        <View
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: spacing[0.5],
                          }}
                        >
                          <View
                            style={{
                              position: 'relative',
                              minWidth: 28,
                              minHeight: 28,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {options.tabBarIcon?.({
                              focused,
                              color: contentColor,
                              size: 28,
                            }) ?? null}
                            {typeof badge === 'number' && badge > 0 ? (
                              <Badge
                                size={18}
                                style={{
                                  position: 'absolute',
                                  top: -6,
                                  right: -10,
                                }}
                              >
                                {badge > 99 ? '99+' : badge}
                              </Badge>
                            ) : typeof badge === 'string' &&
                              badge.length > 0 ? (
                              <Badge
                                size={18}
                                style={{
                                  position: 'absolute',
                                  top: -6,
                                  right: -10,
                                }}
                              >
                                {badge}
                              </Badge>
                            ) : null}
                          </View>
                          <Text
                            style={{
                              color: contentColor,
                              fontSize: 12,
                              lineHeight: 16,
                              fontWeight: focused ? '700' : '600',
                            }}
                            numberOfLines={1}
                          >
                            {String(label)}
                          </Text>
                        </View>
                      );
                    }}
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      }}
    >
      {children}
    </Tabs>
  );
}

MaterialBottomTabs.Screen = Tabs.Screen;
